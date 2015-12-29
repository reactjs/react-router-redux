/*eslint-env mocha */

import expect from 'expect'
import { pushPath, replacePath, UPDATE_PATH, routeReducer, syncReduxAndRouter } from '../src/index'
import { createStore, combineReducers, compose } from 'redux'
import { ActionCreators, instrument } from 'redux-devtools'
import { useBasename } from 'history'

expect.extend({
  toContainRoute({
    path,
    state = undefined,
    replace = false,
    changeId = undefined
  }) {
    const routing = this.actual.getState().routing

    expect(routing.path).toEqual(path)
    expect(routing.state).toEqual(state)
    expect(routing.replace).toEqual(replace)

    if (changeId !== undefined) {
      expect(routing.changeId).toEqual(changeId)
    }
  }
})

function createSyncedHistoryAndStore(createHistory) {
  const store = createStore(combineReducers({
    routing: routeReducer
  }))
  const history = createHistory()
  const unsubscribe = syncReduxAndRouter(history, store)
  return { history, store, unsubscribe }
}

const defaultReset = () => {}

module.exports = function createTests(createHistory, name, reset = defaultReset) {
  describe(name, () => {

    beforeEach(reset)

    describe('pushPath', () => {
      it('creates actions', () => {
        expect(pushPath('/foo', { bar: 'baz' })).toEqual({
          type: UPDATE_PATH,
          payload: {
            path: '/foo',
            replace: false,
            state: { bar: 'baz' },
            avoidRouterUpdate: false
          }
        })

        expect(pushPath('/foo', undefined, { avoidRouterUpdate: true })).toEqual({
          type: UPDATE_PATH,
          payload: {
            path: '/foo',
            state: undefined,
            replace: false,
            avoidRouterUpdate: true
          }
        })
      })
    })

    describe('replacePath', () => {
      it('creates actions', () => {
        expect(replacePath('/foo', { bar: 'baz' })).toEqual({
          type: UPDATE_PATH,
          payload: {
            path: '/foo',
            replace: true,
            state: { bar: 'baz' },
            avoidRouterUpdate: false
          }
        })

        expect(replacePath('/foo', undefined, { avoidRouterUpdate: true })).toEqual({
          type: UPDATE_PATH,
          payload: {
            path: '/foo',
            state: undefined,
            replace: true,
            avoidRouterUpdate: true
          }
        })

        expect(replacePath('/foo', undefined, { avoidRouterUpdate: false })).toEqual({
          type: UPDATE_PATH,
          payload: {
            path: '/foo',
            state: undefined,
            replace: true,
            avoidRouterUpdate: false
          }
        })
      })
    })

    describe('routeReducer', () => {
      const state = {
        path: '/foo',
        changeId: 1
      }

      it('updates the path', () => {
        expect(routeReducer(state, {
          type: UPDATE_PATH,
          payload: {
            path: '/bar',
            replace: false
          }
        })).toEqual({
          path: '/bar',
          replace: false,
          state: undefined,
          changeId: 2
        })
      })

      it('respects replace', () => {
        expect(routeReducer(state, {
          type: UPDATE_PATH,
          payload: {
            path: '/bar',
            replace: true,
            avoidRouterUpdate: false
          }
        })).toEqual({
          path: '/bar',
          replace: true,
          state: undefined,
          changeId: 2
        })
      })

      it('respects `avoidRouterUpdate` flag', () => {
        expect(routeReducer(state, {
          type: UPDATE_PATH,
          payload: {
            path: '/bar',
            replace: false,
            avoidRouterUpdate: true
          }
        })).toEqual({
          path: '/bar',
          replace: false,
          state: undefined,
          changeId: 1
        })
      })
    })

    // To ensure that "Revert" and toggling actions work as expected in
    // Redux DevTools we need a couple of tests for it. In these tests we
    // rely directly on the DevTools, as they implement these actions as
    // middleware, and we don't want to implement this ourselves.
    describe('devtools', () => {
      let history, store, devToolsStore, unsubscribe

      beforeEach(() => {
        history = createHistory()
        const finalCreateStore = compose(instrument())(createStore)
        store = finalCreateStore(combineReducers({
          routing: routeReducer
        }))
        devToolsStore = store.liftedStore

        // Set initial URL before syncing
        history.push('/foo')

        unsubscribe = syncReduxAndRouter(history, store)
      })

      afterEach(() => {
        unsubscribe()
      })

      it('resets to the initial url', () => {
        let currentPath
        const historyUnsubscribe = history.listen(location => {
          currentPath = location.pathname
        })

        history.push('/bar')
        store.dispatch(pushPath('/baz'))

        // By calling reset we expect DevTools to re-play the initial state
        // and the history to update to the initial path
        devToolsStore.dispatch(ActionCreators.reset())

        expect(store.getState().routing.path).toEqual('/foo')
        expect(currentPath).toEqual('/foo')

        historyUnsubscribe()
      })

      it('handles toggle after store change', () => {
        let currentPath
        const historyUnsubscribe = history.listen(location => {
          currentPath = location.pathname
        })

        // DevTools action #2
        history.push('/foo2')
        // DevTools action #3
        history.push('/foo3')

        // When we toggle an action, the devtools will revert the action
        // and we therefore expect the history to update to the previous path
        devToolsStore.dispatch(ActionCreators.toggleAction(3))
        expect(currentPath).toEqual('/foo2')

        historyUnsubscribe()
      })

      it('handles toggle after store change', () => {
        let currentPath
        const historyUnsubscribe = history.listen(location => {
          currentPath = location.pathname
        })

        // DevTools action #2
        store.dispatch(pushPath('/foo2'))
        // DevTools action #3
        store.dispatch(pushPath('/foo3'))

        // When we toggle an action, the devtools will revert the action
        // and we therefore expect the history to update to the previous path
        devToolsStore.dispatch(ActionCreators.toggleAction(3))
        expect(currentPath).toEqual('/foo2')

        historyUnsubscribe()
      })
    })

    describe('syncReduxAndRouter', () => {
      let history, store, unsubscribe

      beforeEach(() => {
        let synced = createSyncedHistoryAndStore(createHistory)
        history = synced.history
        store = synced.store
        unsubscribe = synced.unsubscribe
      })

      afterEach(() => {
        unsubscribe()
      })

      it('syncs router -> redux', () => {
        expect(store).toContainRoute({
          path: '/',
          state: null
        })

        history.push('/foo')
        expect(store).toContainRoute({
          path: '/foo',
          replace: false,
          state: null
        })

        history.push({ state: { bar: 'baz' }, pathname: '/foo' })
        expect(store).toContainRoute({
          path: '/foo',
          replace: true,
          state: { bar: 'baz' }
        })

        history.replace('/bar')
        expect(store).toContainRoute({
          path: '/bar',
          replace: true,
          state: null
        })

        history.push('/bar')
        expect(store).toContainRoute({
          path: '/bar',
          replace: true,
          state: null
        })

        history.push('/bar?query=1')
        expect(store).toContainRoute({
          path: '/bar?query=1',
          replace: false,
          state: null
        })

        history.push('/bar#baz')
        expect(store).toContainRoute({
          path: '/bar#baz',
          replace: false,
          state: null
        })

        history.replace({ 
          state: { bar: 'baz' }, 
          pathname: '/bar?query=1' 
        })
        expect(store).toContainRoute({
          path: '/bar?query=1',
          replace: true,
          state: { bar: 'baz' }
        })

        history.replace({
          state: { bar: 'baz' }, 
          pathname: '/bar?query=1#hash=2'
        })
        expect(store).toContainRoute({
          path: '/bar?query=1#hash=2',
          replace: true,
          state: { bar: 'baz' }
        })
      })

      it('syncs redux -> router', () => {
        expect(store).toContainRoute({
          path: '/',
          replace: false,
          state: null
        })

        store.dispatch(pushPath('/foo'))
        expect(store).toContainRoute({
          path: '/foo',
          replace: false,
          state: undefined
        })

        store.dispatch(pushPath('/foo', { bar: 'baz' }))
        expect(store).toContainRoute({
          path: '/foo',
          replace: false,
          state: { bar: 'baz' }
        })

        store.dispatch(replacePath('/bar', { bar: 'foo' }))
        expect(store).toContainRoute({
          path: '/bar',
          replace: true,
          state: { bar: 'foo' }
        })

        store.dispatch(pushPath('/bar'))
        expect(store).toContainRoute({
          path: '/bar',
          replace: false,
          state: undefined
        })

        store.dispatch(pushPath('/bar?query=1'))
        expect(store).toContainRoute({
          path: '/bar?query=1',
          replace: false,
          state: undefined
        })

        store.dispatch(pushPath('/bar?query=1#hash=2'))
        expect(store).toContainRoute({
          path: '/bar?query=1#hash=2',
          replace: false,
          state: undefined
        })
      })

      it('updates the router even if path is the same', () => {
        const updates = []
        const historyUnsubscribe = history.listen(location => {
          updates.push(location.pathname)
        })

        store.dispatch(pushPath('/foo'))
        store.dispatch(pushPath('/foo'))
        store.dispatch(replacePath('/foo'))

        expect(updates).toEqual([ '/', '/foo', '/foo', '/foo' ])

        historyUnsubscribe()
      })

      it('does not update the router for other state changes', () => {
        const state = store.getState()

        store.dispatch({
          type: 'RANDOM_ACTION',
          payload: {
            payload: {
              value: 5
            }
          }
        })

        expect(state).toEqual(store.getState())
      })

      it('only updates the router once when dispatching from `listenBefore`', () => {
        history.listenBefore(location => {
          expect(location.pathname).toEqual('/foo')
          store.dispatch({
            type: 'RANDOM_ACTION',
            payload: {
              payload: {
                value: 5
              }
            }
          })
        })

        const updates = []
        history.listen(location => {
          updates.push(location.pathname)
        })

        store.dispatch(pushPath('/foo'))

        expect(updates).toEqual([ '/', '/foo' ])
      })

      it('allows updating the route from within `listenBefore`', () => {
        history.listenBefore(location => {
          if(location.pathname === '/foo') {
            store.dispatch(pushPath('/bar'))
          }
          else if(location.pathname === '/replace') {
            store.dispatch(replacePath('/baz', { foo: 'bar' }))
          }
        })

        const updates = []
        history.listen(location => {
          updates.push(location.pathname)
        })

        store.dispatch(pushPath('/foo'))
        expect(store).toContainRoute({
          path: '/bar'
        })

        store.dispatch(pushPath('/replace', { bar: 'baz' }))
        expect(store).toContainRoute({
          path: '/baz',
          state: { foo: 'bar' },
          replace: true
        })

        expect(updates).toEqual([ '/', '/bar', '/baz' ])
      })

      it('throws if "routing" key is missing with default selectRouteState', () => {
        const store = createStore(combineReducers({
          notRouting: routeReducer
        }))
        const history = createHistory()
        expect(
          () => syncReduxAndRouter(history, store)
        ).toThrow(/Cannot sync router: route state does not exist/)
      })

      it('accepts custom selectRouterState', () => {
        const store = createStore(combineReducers({
          notRouting: routeReducer
        }))
        const history = createHistory()
        syncReduxAndRouter(history, store, state => state.notRouting)
        history.push('/bar')
        expect(store.getState().notRouting.path).toEqual('/bar')
      })

      it('returns unsubscribe to stop listening to history and store', () => {
        const store = createStore(combineReducers({
          routing: routeReducer
        }))
        const history = createHistory()
        const unsubscribe = syncReduxAndRouter(history, store)

        history.push('/foo')
        expect(store).toContainRoute({
          path: '/foo',
          state: null
        })

        store.dispatch(pushPath('/bar'))
        expect(store).toContainRoute({
          path: '/bar'
        })

        unsubscribe()

        history.push('/foo')
        expect(store).toContainRoute({
          path: '/bar'
        })

        history.listenBefore(() => {
          throw new Error()
        })
        expect(
          () => store.dispatch(pushPath('/foo'))
        ).toNotThrow()
      })

      it('only triggers history once when updating path via store', () => {
        const updates = []
        const historyUnsubscribe = history.listen(location => {
          updates.push(location.pathname)
        })

        store.dispatch(pushPath('/bar'))
        store.dispatch(pushPath('/baz'))
        expect(updates).toEqual([ '/', '/bar', '/baz' ])

        historyUnsubscribe()
      })

      it('only triggers store once when updating path via store', () => {
        const updates = []
        const storeUnsubscribe = store.subscribe(() => {
          updates.push(store.getState().routing.path)
        })

        store.dispatch(pushPath('/bar'))
        store.dispatch(pushPath('/baz'))
        store.dispatch(replacePath('/foo'))
        expect(updates).toEqual([ '/bar', '/baz', '/foo' ])

        storeUnsubscribe()
      })
    })

    it('handles basename history option', () => {
      const store = createStore(combineReducers({
        routing: routeReducer
      }))
      const history = useBasename(createHistory)({ basename: '/foobar' })
      syncReduxAndRouter(history, store)

      store.dispatch(pushPath('/bar'))
      expect(store).toContainRoute({
        path: '/bar'
      })

      history.push('/baz')
      expect(store).toContainRoute({
        path: '/baz',
        state: null
      })
    })
  })
}
