import expect from 'expect'

import React from 'react'
import ReactDOM from 'react-dom'
import { Router, Route, useRouterHistory } from 'react-router'
import { Provider } from 'react-redux'
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
    query,
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


function createSyncedHistoryAndStore(originalHistory) {

  const store = createStore(combineReducers({
    routing: routerReducer
  }))
  const history = syncHistoryWithStore(originalHistory, store)

  return { history, store }
}

const defaultReset = () => {}

export default function createTests(createHistory, name, reset = defaultReset) {
  describe(name, () => {

    beforeEach(reset)

    describe('syncHistoryWithStore', () => {
      let history, store

      beforeEach(() => {
        let synced = createSyncedHistoryAndStore(createHistory())
        history = synced.history
        store = synced.store
      })

      afterEach(() => {
        history.unsubscribe()
      })

      it('syncs history -> redux', () => {
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
      let originalHistory, history, store, devToolsStore

      beforeEach(() => {
        originalHistory = createHistory()

        // Set initial URL before syncing
        originalHistory.push('/foo')

        store = createStore(
          combineReducers({
            routing: routerReducer
          }),
          instrument()
        )
        devToolsStore = store.liftedStore

        history = syncHistoryWithStore(originalHistory, store)
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

    if (typeof(document) !== 'undefined') {
      describe('Redux Router component', () => {
        let store, history, rootElement

        beforeEach(() => {
          store = createStore(combineReducers({
            routing: routerReducer
          }))

          history = syncHistoryWithStore(useRouterHistory(createHistory)(), store)

          rootElement = document.createElement('div')
          document.body.appendChild(rootElement)
        })

        afterEach(() => {
          history.unsubscribe()
          rootElement.parentNode.removeChild(rootElement)
        })

        it('syncs history -> components', () => {
          history.push('/foo')

          ReactDOM.render(
            React.createElement(Provider, { store },
              React.createElement(Router, { history },
                React.createElement(Route,
                  {
                    path: '/',
                    component: props => React.createElement('span', {}, props.children)
                  },
                  [ 'foo', 'bar' ].map(path =>
                    React.createElement(Route, {
                      path: path,
                      component: () => React.createElement('span', {}, `at /${path}`)
                    })
                  )
                )
              )
            ),
            rootElement
          )
          expect(rootElement.textContent).toEqual('at /foo')

          history.push('/bar')
          expect(rootElement.textContent).toEqual('at /bar')
        })

        it('syncs history -> components when the initial route gets replaced', () => {
          history.push('/foo')

          ReactDOM.render(
            React.createElement(Provider, { store },
              React.createElement(Router, { history }, [
                React.createElement(Route, {
                  path: '/',
                  component: props => React.createElement('span', {}, props.children)
                }, [
                  React.createElement(Route, {
                    path: 'foo',
                    onEnter: (nextState, replace) => replace('/bar')
                  }),
                  React.createElement(Route, {
                    path: 'bar',
                    component: () => React.createElement('span', {}, [ 'at /bar' ])
                  })
                ])
              ])
            ),
            rootElement
          )
          expect(rootElement.textContent).toEqual('at /bar')
        })
      })
    }
  })
}
