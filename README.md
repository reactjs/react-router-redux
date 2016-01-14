# redux-simple-router

[![npm version](https://img.shields.io/npm/v/redux-simple-router.svg?style=flat-square)](https://www.npmjs.com/package/redux-simple-router) [![npm downloads](https://img.shields.io/npm/dm/redux-simple-router.svg?style=flat-square)](https://www.npmjs.com/package/redux-simple-router) [![build status](https://img.shields.io/travis/rackt/redux-simple-router/master.svg?style=flat-square)](https://travis-ci.org/rackt/redux-simple-router)

**Let react-router do all the work**  :sparkles:

[Redux](https://github.com/rackt/redux) is awesome. [React Router](https://github.com/rackt/react-router) is cool. The problem is that react-router manages an important piece of your application state: the URL. If you are using redux, you want your app state to fully represent your UI; if you snapshotted the app state, you should be able to load it up later and see the same thing.

react-router does a great job of mapping the current URL to a component tree, and continually does so with any URL changes. This is very useful, but we really want to store this state in redux as well.

The entire state that we are interested in boils down to one thing: the URL. This is an extremely simple library that just puts the URL in redux state and keeps it in sync with any react-router changes. Additionally, you can change the URL via redux and react-router will change accordingly.

```
npm install redux-simple-router
```

If you want to install the next major version, use `redux-simple-router@next`. Run `npm dist-tag ls redux-simple-router` to see what `next` is aliased to.

View the [CHANGELOG](https://github.com/jlongster/redux-simple-router/blob/master/CHANGELOG.md) for recent changes.

Read the [API docs](#api) farther down this page.

##### _What about redux-router?_

[redux-router](https://github.com/rackt/redux-router) is another project which solves the same problem. However, it's far more complex. Take a quick look at [the code for this library](https://github.com/jlongster/redux-simple-router/blob/master/src/index.js)—it's extremely minimal. redux-router is much bigger and more complex.

That said, redux-router is a fine project and has features this doesn't provide. Use it if you like it better.

**Compared with redux-router:**

* Much smaller and simpler. You don't need to learn another library on top of everything else.
* We encourage direct access of react-router APIs. Need server-side rendering, or something else advanced? Just read react-router's docs.
* We only store current URL and state, whereas redux-router stores the entire location object from react-router.

### Usage

The idea of this library is to use react-router's functionality exactly like its documentation tells you to. You can access all of its APIs in routing components. Additionally, you can use redux like you normally would, with a single app state and "connected" components. It's even possible for a single component to be both if needed.

[redux](https://github.com/rackt/redux) (`store.routing`) &nbsp;&harr;&nbsp; [**redux-simple-router**](https://github.com/jlongster/redux-simple-router) &nbsp;&harr;&nbsp; [history](https://github.com/rackt/history) (`history.location`) &nbsp;&harr;&nbsp; [react-router](https://github.com/rackt/react-router)

We only store current URL and state, whereas redux-router stores the entire location object from react-router. You can read it, and also change it with an action.

### Tutorial

Let's take a look at a simple example.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { compose, createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route } from 'react-router'
import { createHistory } from 'history'
import { syncHistory, routeReducer } from 'redux-simple-router'
import reducers from '<project-path>/reducers'

const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routeReducer
}))
const history = createHistory()

// Sync dispatched route actions to the history
const reduxRouterMiddleware = syncHistory(history)
const createStoreWithMiddleware = applyMiddleware(reduxRouterMiddleware)(createStore)

const store = createStoreWithMiddleware(reducer)

// Required for replaying actions from devtools to work
reduxRouterMiddleware.listenForReplays(store)

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

Now you can read from `state.routing.location.pathname` to get the URL. It's far more likely that you want to change the URL more often, however. You can use the `push` action creator that we provide:

```js
import { routeActions } from 'redux-simple-router'

function MyComponent({ dispatch }) {
  return <Button onClick={() => dispatch(routeActions.push('/foo'))}/>;
}
```

This will change the state, which will trigger a change in react-router. Additionally, if you want to respond to the path update action, just handle the `UPDATE_LOCATION` constant that we provide:

```js
import { UPDATE_LOCATION } from 'redux-simple-router'

function update(state, action) {
  switch(action.type) {
  case UPDATE_LOCATION:
    // do something here
  }
}
```

### Examples

* [examples/basic](https://github.com/jlongster/redux-simple-router/blob/master/examples/basic) - basic reference implementation

Examples from the community:

* [davezuko/react-redux-starter-kit](https://github.com/davezuko/react-redux-starter-kit) - popular redux starter kit
  * **tip**: migrating from redux-router? use [this commit](https://github.com/davezuko/react-redux-starter-kit/commit/db66626ca8a02ecf030a3f7f5a669ac338fd5897) as a reference
* [freeqaz/redux-simple-router-example](https://github.com/freeqaz/redux-simple-router-example) - example implementation
* [choonkending/react-webpack-node](https://github.com/choonkending/react-webpack-node) - boilerplate for universal redux and react-router
* [tj/frontend-boilerplate](https://github.com/tj/frontend-boilerplate)
* [bdefore/universal-redux](https://github.com/bdefore/universal-redux) - npm package for universally rendered redux applications
* [yangli1990/react-redux-isomorphic](https://github.com/yangli1990/Isomorphic-Universal-React-Template) - boilerplate for universal redux and redux-simple-router

_Have an example to add? Send us a PR!_

### API

**This API is for an unreleased version. To view docs for 1.0.2, [click here](https://github.com/rackt/redux-simple-router/tree/1.0.2#api)**

#### `syncHistory(history: History) => ReduxMiddleware`

Call this to create a middleware that can be applied with Redux's `applyMiddleware` to allow actions to call history methods. The middleware will look for route actions created by `push`, `replace`, etc. and applies them to the history.

#### `ReduxMiddleware.listenForReplays(store: ReduxStore, selectRouterState?: function)`

By default, the syncing logic will not respond to replaying of actions, which means it won't work with projects like redux-devtools. Call this function on the middleware object returned from `syncHistory` and give it the store to listen to, and it will properly work with action replays. Obviously, you would do that after you have created the store and everything else has been set up.

Supply an optional function `selectRouterState` to customize where to find the router state on your app state. It defaults to `state => state.routing`, so you would install the reducer under the name "routing". Feel free to change this to whatever you like.

#### `ReduxMiddleware.unsubscribe()`

Call this on the middleware returned from `syncHistory` to stop the syncing process set up by `listenForReplays`. 

#### `routeReducer`

A reducer function that keeps track of the router state. You must to add this reducer to your app reducers when creating the store.

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
