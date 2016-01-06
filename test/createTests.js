/*eslint-env mocha */

import expect from 'expect'
import {
  routeActions, TRANSITION, UPDATE_LOCATION, routeReducer, syncHistory
} from '../src/index'
import { applyMiddleware, createStore, combineReducers, compose } from 'redux'
import { ActionCreators, instrument } from 'redux-devtools'
import { useBasename, useQueries } from 'history'

expect.extend({
  toContainLocation({
    pathname,
    search = '',
    hash = '',
    state = null,
    query,
    action = 'PUSH'
  }) {
    const { location } = this.actual.getState().routing

    expect(location.pathname).toEqual(pathname)
    expect(location.search).toEqual(search)
    expect(location.state).toEqual(state)
    expect(location.query).toEqual(query)
    expect(location.action).toEqual(action)
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

const { push, replace, go, goBack, goForward } = routeActions

module.exports = function createTests(createHistory, name, reset = defaultReset) {
  describe(name, () => {

    beforeEach(reset)

    describe('routeActions', () => {

      describe('push', () => {
        it('creates actions', () => {
          expect(push('/foo')).toEqual({
            type: TRANSITION,
            method: 'push',
            arg: '/foo'
          })

          expect(push({ pathname: '/foo', state: { the: 'state' } })).toEqual({
            type: TRANSITION,
            method: 'push',
            arg: {
              pathname: '/foo',
              state: { the: 'state' }
            }
          })
        })
      })

      describe('replace', () => {
        it('creates actions', () => {
          expect(replace('/foo')).toEqual({
            type: TRANSITION,
            method: 'replace',
            arg: '/foo'
          })

          expect(replace({ pathname: '/foo', state: { the: 'state' } })).toEqual({
            type: TRANSITION,
            method: 'replace',
            arg: {
              pathname: '/foo',
              state: { the: 'state' }
            }
          })
        })
      })

      describe('go', () => {
        it('creates actions', () => {
          expect(go(1)).toEqual({
            type: TRANSITION,
            method: 'go',
            arg: 1
          })
        })
      })

      describe('goBack', () => {
        it('creates actions', () => {
          expect(goBack()).toEqual({
            type: TRANSITION,
            method: 'goBack',
            arg: undefined
          })
        })
      })

      describe('goForward', () => {
        it('creates actions', () => {
          expect(goForward()).toEqual({
            type: TRANSITION,
            method: 'goForward',
            arg: undefined
          })
        })
      })

    })

    describe('routeReducer', () => {
      const state = {
        location: {
          pathname: '/foo',
          action: 'POP'
        }
      }

      it('updates the path', () => {
        expect(routeReducer(state, {
          type: UPDATE_LOCATION,
          location: {
            path: '/bar',
            action: 'PUSH'
          }
        })).toEqual({
          location: {
            path: '/bar',
            action: 'PUSH'
          }
        })
      })

      it('respects replace', () => {
        expect(routeReducer(state, {
          type: UPDATE_LOCATION,
          location: {
            path: '/bar',
            action: 'REPLACE'
          }
        })).toEqual({
          location: {
            path: '/bar',
            action: 'REPLACE'
          }
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
          instrument()
        )(createStore)
        store = finalCreateStore(combineReducers({
          routing: routeReducer
        }))
        devToolsStore = store.liftedStore

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
        store.dispatch(push('/baz'))

        // By calling reset we expect DevTools to re-play the initial state
        // and the history to update to the initial path
        devToolsStore.dispatch(ActionCreators.reset())

        expect(store.getState().routing.location.pathname).toEqual('/foo')
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
        store.dispatch(push('/foo2'))
        // DevTools action #3
        store.dispatch(push('/foo3'))

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
        expect(store).toContainLocation({
          pathname: '/',
          action: 'POP'
        })

        history.push('/foo')
        expect(store).toContainLocation({
          pathname: '/foo'
        })

        history.push({ state: { bar: 'baz' }, pathname: '/foo' })
        expect(store).toContainLocation({
          pathname: '/foo',
          state: { bar: 'baz' },
          action: 'REPLACE' // Converted by history.
        })

        history.replace('/bar')
        expect(store).toContainLocation({
          pathname: '/bar',
          action: 'REPLACE'
        })

        history.push('/bar')
        expect(store).toContainLocation({
          pathname: '/bar',
          action: 'REPLACE' // Converted by history.
        })

        history.push('/bar?query=1')
        expect(store).toContainLocation({
          pathname: '/bar',
          search: '?query=1'
        })

        history.push('/bar#baz')
        expect(store).toContainLocation({
          pathname: '/bar',
          hash: '#baz'
        })

        history.replace({
          pathname: '/bar',
          search: '?query=1',
          state: { bar: 'baz' }
        })
        expect(store).toContainLocation({
          pathname: '/bar',
          search: '?query=1',
          state: { bar: 'baz' },
          action: 'REPLACE'
        })

        history.replace({
          pathname: '/bar',
          search: '?query=1',
          hash: '#hash=2',
          state: { bar: 'baz' }
        })
        expect(store).toContainLocation({
          pathname: '/bar',
          search: '?query=1',
          hash: '#hash=2',
          state: { bar: 'baz' },
          action: 'REPLACE'
        })
      })

      it('syncs redux -> router', () => {
        expect(store).toContainLocation({
          pathname: '/',
          action: 'POP'
        })

        store.dispatch(push('/foo'))
        expect(store).toContainLocation({
          pathname: '/foo'
        })

        store.dispatch(push({ pathname: '/foo', state: { bar: 'baz' } }))
        expect(store).toContainLocation({
          pathname: '/foo',
          state: { bar: 'baz' },
          action: 'REPLACE' // Converted by history.
        })

        store.dispatch(replace({ pathname: '/bar', state: { bar: 'foo' } }))
        expect(store).toContainLocation({
          pathname: '/bar',
          state: { bar: 'foo' },
          action: 'REPLACE'
        })

        store.dispatch(push('/bar'))
        expect(store).toContainLocation({
          pathname: '/bar',
          action: 'REPLACE' // Converted by history.
        })

        store.dispatch(push('/bar?query=1'))
        expect(store).toContainLocation({
          pathname: '/bar',
          search: '?query=1'
        })

        store.dispatch(push('/bar?query=1#hash=2'))
        expect(store).toContainLocation({
          pathname: '/bar',
          search: '?query=1',
          hash: '#hash=2'
        })
      })

      it('updates the router even if path is the same', () => {
        const updates = []
        const historyUnsubscribe = history.listen(location => {
          updates.push(location.pathname)
        })

        store.dispatch(push('/foo'))
        store.dispatch(push('/foo'))
        store.dispatch(replace('/foo'))

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

        store.dispatch(push('/foo'))

        expect(updates).toEqual([ '/', '/foo' ])
      })

      it('allows updating the route from within `listenBefore`', () => {
        history.listenBefore(location => {
          if(location.pathname === '/foo') {
            store.dispatch(push('/bar'))
          }
          else if(location.pathname === '/replace') {
            store.dispatch(replace({ pathname: '/baz', state: { foo: 'bar' } }))
          }
        })

        const updates = []
        history.listen(location => {
          updates.push(location.pathname)
        })

        store.dispatch(push('/foo'))
        expect(store).toContainLocation({
          pathname: '/bar'
        })

        store.dispatch(push({ pathname: '/replace', state: { bar: 'baz' } }))
        expect(store).toContainLocation({
          pathname: '/baz',
          state: { foo: 'bar' },
          action: 'REPLACE'
        })

        expect(updates).toEqual([ '/', '/bar', '/baz' ])
      })

      it('returns unsubscribe to stop listening to history and store', () => {
        history.push('/foo')
        expect(store).toContainLocation({
          pathname: '/foo'
        })

        store.dispatch(push('/bar'))
        expect(store).toContainLocation({
          pathname: '/bar'
        })

        unsubscribe()

        // Make the teardown a no-op.
        unsubscribe = () => {}

        history.push('/foo')
        expect(store).toContainLocation({
          pathname: '/bar'
        })

        history.listenBefore(() => {
          throw new Error()
        })
        expect(
          () => store.dispatch(push('/foo'))
        ).toNotThrow()
      })

      it('only triggers history once when updating path via store', () => {
        const updates = []
        const historyUnsubscribe = history.listen(location => {
          updates.push(location.pathname)
        })

        store.dispatch(push('/bar'))
        store.dispatch(push('/baz'))
        expect(updates).toEqual([ '/', '/bar', '/baz' ])

        historyUnsubscribe()
      })

      it('only triggers store once when updating path via store', () => {
        const updates = []
        const storeUnsubscribe = store.subscribe(() => {
          updates.push(store.getState().routing.location.pathname)
        })

        store.dispatch(push('/bar'))
        store.dispatch(push('/baz'))
        store.dispatch(replace('/foo'))
        expect(updates).toEqual([ '/bar', '/baz', '/foo' ])

        storeUnsubscribe()
      })
    })

    describe('query support', () => {
      let history, store, unsubscribe

      beforeEach(() => {
        const synced = createSyncedHistoryAndStore(useQueries(createHistory))
        history = synced.history
        store = synced.store
        unsubscribe = synced.unsubscribe
      })

      afterEach(() => {
        unsubscribe()
      })

      it('handles location queries', () => {
        store.dispatch(push({ pathname: '/bar', query: { the: 'query' } }))
        expect(store).toContainLocation({
          pathname: '/bar',
          query: { the: 'query' },
          search: '?the=query'
        })

        history.push({ pathname: '/baz', query: { other: 'query' } })
        expect(store).toContainLocation({
          pathname: '/baz',
          query: { other: 'query' },
          search: '?other=query'
        })

        store.dispatch(push('/foo'))
        expect(store).toContainLocation({
          pathname: '/foo',
          query: {}
        })
      })
    })

    describe('basename support', () => {
      let history, store, unsubscribe

      beforeEach(() => {
        const synced = createSyncedHistoryAndStore(
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
        store.dispatch(push('/bar'))
        expect(store).toContainLocation({
          pathname: '/bar'
        })

        history.push('/baz')
        expect(store).toContainLocation({
          pathname: '/baz'
        })
      })
    })
  })
}
