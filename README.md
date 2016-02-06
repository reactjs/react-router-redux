# react-router-redux

[![npm version](https://img.shields.io/npm/v/react-router-redux.svg?style=flat-square)](https://www.npmjs.com/package/react-router-redux) [![npm downloads](https://img.shields.io/npm/dm/react-router-redux.svg?style=flat-square)](https://www.npmjs.com/package/react-router-redux) [![build status](https://img.shields.io/travis/rackt/react-router-redux/master.svg?style=flat-square)](https://travis-ci.org/rackt/react-router-redux)

**Let react-router do all the work**  :sparkles:

_Formerly known as redux-simple-router_

[Redux](https://github.com/rackt/redux) is awesome. [React Router](https://github.com/rackt/react-router) is cool. The problem is that react-router manages an important piece of your application state: the URL. If you are using redux, you want your app state to fully represent your UI; if you snapshotted the app state, you should be able to load it up later and see the same thing.

react-router does a great job of mapping the current URL to a component tree, and continually does so with any URL changes. This is very useful, but we really want to store this state in redux as well.

The entire state that we are interested in boils down to one thing: the URL. This is an extremely simple library that just puts the URL in redux state and keeps it in sync with any react-router changes. Additionally, you can change the URL via redux and react-router will change accordingly.

```
npm install react-router-redux
```

If you want to install the next major version, use `react-router-redux@next`. Run `npm dist-tag ls react-router-redux` to see what `next` is aliased to.

View the [CHANGELOG](https://github.com/rackt/react-router-redux/blob/master/CHANGELOG.md) for recent changes.

Read the [API docs](#api) farther down this page.

**Note:** We are [currently discussing some major changes](https://github.com/rackt/react-router-redux/issues/257) to the library. [React Router's API in 2.0](https://github.com/rackt/react-router/blob/master/upgrade-guides/v2.0.0.md) is significantly improved and makes things like action creators and reading location state from Redux obsolete. This library is still critical to enable things like time traveling and persisting state, so we're not going anywhere. But in many cases, you may not need this library and can simply use the provided React Router APIs. Go check them out and drop some technical debt. :smile:

### Usage

The idea of this library is to use react-router's functionality exactly like its documentation tells you to. You can access all of its APIs in routing components. Additionally, you can use redux like you normally would, with a single app state.

[redux](https://github.com/rackt/redux) (`store.routing`) &nbsp;&harr;&nbsp; [**react-router-redux**](https://github.com/rackt/react-router-redux) &nbsp;&harr;&nbsp; [history](https://github.com/rackt/history) (`history.location`) &nbsp;&harr;&nbsp; [react-router](https://github.com/rackt/react-router)

We only store current URL and state, whereas redux-router stores the entire location object from react-router. You can read it, and also change it with an action.

### Tutorial

Let's take a look at a simple example.

**Note:** This example uses `react-router`'s 2.0 API, which is currently released under version 2.0.0-rc5.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import reducers from '<project-path>/reducers'

const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routerReducer
}))

const store = createStore(reducer)

// Sync dispatched route actions to the history
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <Route path="foo" component={Foo}/>
        <Route path="bar" component={Bar}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('mount')
)
```

Now you can read from `state.routing.locationBeforeTransitions.pathname` to get the URL. It's far more likely that you want to change the URL more often, however. You can use the `push` action creator that we provide:

```js
import { routeActions } from 'react-router-redux'

function MyComponent({ dispatch }) {
  return <Button onClick={() => dispatch(routeActions.push('/foo'))}/>;
}
```

This will change the state, which will trigger a change in react-router. Additionally, if you want to respond to the path update action, just handle the `UPDATE_LOCATION` constant that we provide:

```js
import { UPDATE_LOCATION } from 'react-router-redux'

function update(state, action) {
  switch(action.type) {
  case UPDATE_LOCATION:
    // do something here
  }
}
```
**But how do I access router props in a Container component?**

react-router [injects route information via a child component's props](https://github.com/rackt/react-router/blob/latest/docs/Introduction.md#getting-url-parameters). This makes accessing them from a simple component easy. When using a react-redux Container to connect simple components to the store state and dispatch you can access these injected route information from the [2nd argument of `mapStateToProps`](https://github.com/rackt/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) as follows:

```js
function mapStateToProps(state, ownProps) {
  return {
    id: ownProps.params.id,
    filter: ownProps.location.query.filter
  };
}
```


### Examples

* [examples/basic](https://github.com/rackt/react-router-redux/blob/master/examples/basic) - basic reference implementation

Examples from the community:

* [davezuko/react-redux-starter-kit](https://github.com/davezuko/react-redux-starter-kit) - popular redux starter kit
  * **tip**: migrating from redux-router? use [this commit](https://github.com/davezuko/react-redux-starter-kit/commit/db66626ca8a02ecf030a3f7f5a669ac338fd5897) as a reference
* [freeqaz/redux-simple-router-example](https://github.com/freeqaz/redux-simple-router-example) - example implementation
* [choonkending/react-webpack-node](https://github.com/choonkending/react-webpack-node) - boilerplate for universal redux and react-router
* [tj/frontend-boilerplate](https://github.com/tj/frontend-boilerplate)
* [bdefore/universal-redux](https://github.com/bdefore/universal-redux) - npm package for universally rendered redux applications
* [tomatau/breko-hub](https://github.com/tomatau/breko-hub) - Babel, React & Koa, Hot Universal Boilerplate - focused on developer experience.
* [yangli1990/react-redux-isomorphic](https://github.com/yangli1990/Isomorphic-Universal-React-Template) - boilerplate for universal redux and redux-simple-router
* [StevenIseki/redux-simple-router-example](https://github.com/StevenIseki/redux-simple-router-example)
* [mattkrick/meatier](https://github.com/mattkrick/meatier) - SSR, dual dev/prod client builds
* [mxstbr/react-boilerplate](https://github.com/mxstbr/react-boilerplate/tree/v3.0.0) - :fire: Quick setup for performance orientated, offline first React.js applications
  * **Tip**: Upgrading from react-router w/o react-router-redux? Use [this PR](https://github.com/mxstbr/react-boilerplate/pull/98/files) as a reference!

_Have an example to add? Send us a PR!_

### API

#### `history = syncHistoryWithStore(history: History, store, [options])`

We now sync by enhancing the history instance to listen for navigation events and dispatch those into the store. The enhanced history has its listen method overridden to respond to store changes, rather than directly to navigation events. When this history is provided to <Router>, the router will listen to it and receive these store changes. This means if we time travel with the store, the router will receive those store changes and update based on the location in the store, instead of what the browser says. Normal navigation events (hitting your browser back/forward buttons, telling a history singleton to push a location) flow through the history's listener like normal, so all the usual stuff works A-OK.

#### Arguments

* `history` *(Object)* History object that will have its `listen` method enhanced. This can be the result of `createHistory()` or simply the `hashHistory` or `browserHistory` import from `react-router`.
* `store ` *(Object)* Fully formed Redux store.
* [`options`] *(Object)* If specified, further customizes the behavior of the sync.
  * [`selectLocationState = defaultSelectLocationState`] *(Function)*: Returns state slice where routing reducer is mounted. Default function returns `state.routing`.
  * [`adjustUrlOnReplay = true`] *(Boolean)*: If true, store changes to `locationBeforeTransitions` will be synced with history via the `push` method. *Defaults to `true`.*

#### `routerReducer`

A reducer function that keeps track of the router state. You must add this reducer to your app reducers when creating the store. It will return a `location` property in state. If you use `combineReducers`, it will be nested under wherever property you add it to (`state.routing` in the example above).

**Warning:** It is a bad pattern to use `react-redux`'s `connect` decorator to map the state from this reducer to props on your `Route` components. This can lead to infinite loops and performance problems. `react-router` already provides this for you via `this.props.location`.

#### `UPDATE_LOCATION`

An action type that you can listen for in your reducers to be notified of route updates.

#### `routeActions`

An object that contains all the actions creators you can use to manipulate history:

* `push(nextLocation: LocationDescriptor)`
* `replace(nextLocation: LocationDescriptor)`
* `go(n: number)`
* `goForward()`
* `goBack()`

A [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor) can be a descriptive object (see the link) or a normal URL string. The most common action is to push a new URL via `routeActions.push(...)`. These all directly call the analogous [history methods](https://github.com/rackt/history/blob/master/docs/GettingStarted.md#navigation).
