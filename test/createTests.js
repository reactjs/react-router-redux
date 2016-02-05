/*eslint-env mocha */

import expect from 'expect'

import { createStore, combineReducers } from 'redux'
// import { ActionCreators, instrument } from 'redux-devtools'
// import { useBasename, useQueries } from 'history'

import syncHistoryWithStore from '../src/sync'
import { routerReducer } from '../src/reducer'
// import {
//   UPDATE_LOCATION,
//   push, replace, go, goBack, goForward,
//   routeActions
// } from '../src/actions'
// import routerMiddleware from '../src/middleware'

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

module.exports = function createTests(testHistory, name, reset = defaultReset) {
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
    })

  })
}
