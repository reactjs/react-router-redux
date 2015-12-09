const React = require('react');
const ReactDOM = require('react-dom');
const { compose, createStore, combineReducers } = require('redux');
const { Provider } = require('react-redux');
const { Router, Route, IndexRoute } = require('react-router');
const createHistory = require('history/lib/createHashHistory');
const { syncReduxAndRouter, routeReducer } = require('redux-simple-router');
import { devTools } from 'redux-devtools';
const { DevTools, DebugPanel, LogMonitor } = require('redux-devtools/lib/react');

const reducers = require('./reducers');
const { App, Home, Foo, Bar } = require('./components');

const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routeReducer
}));
const finalCreateStore = compose(
  devTools()
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
      <DebugPanel top right bottom>
        <DevTools store={store} monitor={LogMonitor} />
      </DebugPanel>
    </div>
  </Provider>,
  document.getElementById('mount')
);
