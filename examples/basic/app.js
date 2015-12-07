const React = require('react');
const ReactDOM = require('react-dom');
const { Provider } = require('react-redux');
const { Router, Route, IndexRoute } = require('react-router');
const createHistory = require('history/lib/createBrowserHistory');
const { syncReduxAndRouter, routeReducer } = require('redux-simple-router');
const { compose, createStore, combineReducers, applyMiddleware } = require('redux');
const { createDevTools, persistState } = require('redux-devtools');
const LogMonitor = require('redux-devtools-log-monitor');
const DockMonitor = require('redux-devtools-dock-monitor');

const reducers = require('./reducers');
const { App, Home, Foo, Bar } = require('./components');

const DevTools = createDevTools(
    <DockMonitor 
      position='right'
      toggleVisibilityKey='H'
      changePositionKey='Q'>
      <LogMonitor />
    </DockMonitor>
  );

const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routeReducer
}));
const finalCreateStore = compose(
  DevTools.instrument(),
  persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
)(createStore);
const store = finalCreateStore(reducer);
const history = createHistory();

syncReduxAndRouter(history, store);

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
      <DevTools/>
    </div>
  </Provider>,
  document.getElementById('mount')
);
