import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'

import React from 'react'
import ReactDOM from 'react-dom'
import { applyMiddleware, compose, createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, IndexRoute } from 'react-router'
import createHistory from 'history/lib/createHashHistory'
import { syncHistory, routeReducer } from 'redux-simple-router'

import * as reducers from './reducers'
import { App, Home, Foo, Bar } from './components'

const history = createHistory()
const middleware = syncHistory(history)
const reducer = combineReducers({
  ...reducers,
  routing: routeReducer
})

const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h"
               changePositionKey="ctrl-q">
    <LogMonitor theme="tomorrow" />
  </DockMonitor>
)

const finalCreateStore = compose(
  applyMiddleware(middleware),
  DevTools.instrument()
)(createStore)
const store = finalCreateStore(reducer)
middleware.listenForReplays(store)

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Router history={history}>
        <Route path="/" component={App}>
          <IndexRoute component={Home}/>
          <Route path="foo" component={Foo}/>
          <Route path="bar" component={Bar}/>
        </Route>
      </Router>
      <DevTools />
    </div>
  </Provider>,
  document.getElementById('mount')
)
