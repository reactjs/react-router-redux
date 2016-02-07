import expect from 'expect'

import { createStore, combineReducers } from 'redux'
import { ActionCreators, instrument } from 'redux-devtools'

import syncHistoryWithStore from '../src/sync'
import { routerReducer } from '../src/reducer'

expect.extend({
  toContainLocation({
    pathname,
    search = '',
    hash = '',
    state = null,
    query = {},
    action = 'PUSH'
  }) {
    const { locationBeforeTransitions } = this.actual.getState().routing
    const location = locationBeforeTransitions

    expect(location.pathname).toEqual(pathname)
    expect(location.search).toEqual(search)
    expect(location.hash).toEqual(hash)
    expect(location.state).toEqual(state)
    expect(location.query).toEqual(query)
    expect(location.action).toEqual(action)
  }
})


function createSyncedHistoryAndStore(testHistory) {

  const store = createStore(combineReducers({
    routing: routerReducer
  }))
  const history = syncHistoryWithStore(testHistory, store)

  return { history, store }
}

const defaultReset = () => {}

export default function createTests(testHistory, name, reset = defaultReset) {
  describe(name, () => {

    beforeEach(reset)

    describe('syncHistoryWithStore', () => {
      let history, store

      beforeEach(() => {
        let synced = createSyncedHistoryAndStore(testHistory)
        history = synced.history
        store = synced.store
      })

      afterEach(() => {
        history.unsubscribe()
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
          action: 'PUSH'
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
          search: '?query=1',
          query: { query: '1' }
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
          query: { query: '1' },
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
          query: { query: '1' },
          hash: '#hash=2',
          state: { bar: 'baz' },
          action: 'REPLACE'
        })
      })

      it('provices an unsubscribe method to stop listening to history and store', () => {
        history.push('/foo')
        expect(store).toContainLocation({
          pathname: '/foo'
        })

        history.unsubscribe()

        history.push('/bar')
        expect(store).toContainLocation({
          pathname: '/foo'
        })
      })

      it('updates the router even if path is the same', () => {
        history.push('/')

        const updates = []
        const historyUnsubscribe = history.listen(location => {
          updates.push(location.pathname)
        })

        history.push('/foo')
        history.push('/foo')
        history.replace('/foo')

        expect(updates).toEqual([ '/', '/foo', '/foo', '/foo' ])

        historyUnsubscribe()
      })
    })

    describe('Redux DevTools', () => {
      let history, store, devToolsStore

      beforeEach(() => {
        // Set initial URL before syncing
        testHistory.push('/foo')

        store = createStore(
          combineReducers({
            routing: routerReducer
          }),
          instrument()
        )
        devToolsStore = store.liftedStore

        history = syncHistoryWithStore(testHistory, store)
      })

      afterEach(() => {
        history.unsubscribe()
      })

      it('resets to the initial url', () => {
        let currentPath
        const historyUnsubscribe = history.listen(location => {
          currentPath = location.pathname
        })

        history.push('/bar')
        devToolsStore.dispatch(ActionCreators.reset())

        expect(currentPath).toEqual('/foo')

        historyUnsubscribe()
      })

      it('handles toggle after history change', () => {
        let currentPath
        const historyUnsubscribe = history.listen(location => {
          currentPath = location.pathname
        })

        history.push('/foo2') // DevTools action #2
        history.push('/foo3') // DevTools action #3

        // When we toggle an action, the devtools will revert the action
        // and we therefore expect the history to update to the previous path
        devToolsStore.dispatch(ActionCreators.toggleAction(3))
        expect(currentPath).toEqual('/foo2')

        historyUnsubscribe()
      })
    })
  })
}
