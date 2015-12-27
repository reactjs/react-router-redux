/*eslint-env mocha */

import expect from 'expect'
import { pushPath, replacePath, UPDATE_PATH, routeReducer, syncHistory } from '../src/index'
import { applyMiddleware, createStore, combineReducers, compose } from 'redux'
import { devTools } from 'redux-devtools'
import { ActionCreators } from 'redux-devtools/lib/devTools'
import { useBasename } from 'history'

expect.extend({
  toContainRoute({
    path,
    state = undefined,
    replace = false
  }) {
    const routing = this.actual.getState().routing

    expect(routing.path).toEqual(path)
    expect(routing.state).toEqual(state)
    expect(routing.replace).toEqual(replace)
  }
})

function createSyncedHistoryAndStore(createHistory) {
  const history = createHistory()
  const middleware = syncHistory(history)
  const { unsubscribe } = middleware

  const createStoreWithMiddleware = applyMiddleware(middleware)(createStore)
  const store = createStoreWithMiddleware(combineReducers({
    routing: routeReducer
  }))

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
            key: undefined
          }
        })

        expect(pushPath('/foo', undefined, 'foo')).toEqual({
          type: UPDATE_PATH,
          payload: {
            path: '/foo',
            state: undefined,
            replace: false,
            key: 'foo'
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
            key: undefined
          }
        })

        expect(replacePath('/foo', undefined, 'foo')).toEqual({
          type: UPDATE_PATH,
          payload: {
            path: '/foo',
            state: undefined,
            replace: true,
            key: 'foo'
          }
        })

        expect(replacePath('/foo', undefined, undefined)).toEqual({
          type: UPDATE_PATH,
          payload: {
            path: '/foo',
            state: undefined,
            replace: true,
            key: undefined
          }
        })
      })
    })

    describe('routeReducer', () => {
      const state = {
        path: '/foo'
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
          replace: false
        })
      })

      it('respects replace', () => {
        expect(routeReducer(state, {
          type: UPDATE_PATH,
          payload: {
            path: '/bar',
            replace: true
          }
        })).toEqual({
          path: '/bar',
          replace: true
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

        // Set initial URL before syncing
        history.push('/foo')

        const middleware = syncHistory(history)
        unsubscribe = middleware.unsubscribe

        const finalCreateStore = compose(
          applyMiddleware(middleware),
          devTools()
        )(createStore)
        store = finalCreateStore(combineReducers({
          routing: routeReducer
        }))
        devToolsStore = store.devToolsStore

        middleware.syncHistoryToStore(store)
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

      it('handles toggle after history change', () => {
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
          state: null
        })

        // history changes this from PUSH to REPLACE
        store.dispatch(pushPath('/foo', { bar: 'baz' }))
        expect(store).toContainRoute({
          path: '/foo',
          replace: true,
          state: { bar: 'baz' }
        })

        store.dispatch(replacePath('/bar', { bar: 'foo' }))
        expect(store).toContainRoute({
          path: '/bar',
          replace: true,
          state: { bar: 'foo' }
        })

        // history changes this from PUSH to REPLACE
        store.dispatch(pushPath('/bar'))
        expect(store).toContainRoute({
          path: '/bar',
          replace: true,
          state: null
        })

        store.dispatch(pushPath('/bar?query=1'))
        expect(store).toContainRoute({
          path: '/bar?query=1',
          replace: false,
          state: null
        })

        store.dispatch(pushPath('/bar?query=1#hash=2'))
        expect(store).toContainRoute({
          path: '/bar?query=1#hash=2',
          replace: false,
          state: null
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
          path: '/bar',
          state: null
        })

        store.dispatch(pushPath('/replace', { bar: 'baz' }))
        expect(store).toContainRoute({
          path: '/baz',
          state: { foo: 'bar' },
          replace: true
        })

        expect(updates).toEqual([ '/', '/bar', '/baz' ])
      })

      it('returns unsubscribe to stop listening to history and store', () => {
        history.push('/foo')
        expect(store).toContainRoute({
          path: '/foo',
          state: null
        })

        store.dispatch(pushPath('/bar'))
        expect(store).toContainRoute({
          path: '/bar',
          state: null
        })

        unsubscribe()

        // Make the teardown a no-op.
        unsubscribe = () => {}

        history.push('/foo')
        expect(store).toContainRoute({
          path: '/bar',
          state: null
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

    describe('basename support', () => {
      let history, store, unsubscribe

      beforeEach(() => {
        let synced = createSyncedHistoryAndStore(
          () => useBasename(createHistory)({ basename: '/foobar' })
        )
        history = synced.history
        store = synced.store
        unsubscribe = synced.unsubscribe
      })

      afterEach(() => {
        unsubscribe()
      })

      it('handles basename history option', () => {
        store.dispatch(pushPath('/bar'))
        expect(store).toContainRoute({
          path: '/bar',
          state: null
        })

        history.push('/baz')
        expect(store).toContainRoute({
          path: '/baz',
          state: null
        })
      })
    })
  })
}
