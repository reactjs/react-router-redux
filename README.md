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
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route } from 'react-router'
import { createHistory } from 'history'
import { syncReduxAndRouter, routeReducer } from 'redux-simple-router'
import reducers from '<project-path>/reducers'

const reducer = combineReducers(Object.assign({}, reducers, {
  routing: routeReducer
}))
const store = createStore(reducer)
const history = createHistory()

syncReduxAndRouter(history, store)

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

Now you can read from `state.routing.path` to get the URL. It's far more likely that you want to change the URL more often, however. You can use the `pushPath` action creator that we provide:

```js
import { pushPath } from 'redux-simple-router'

function MyComponent({ dispatch }) {
  return <Button onClick={() => dispatch(pushPath('/foo'))}/>;
}
```

This will change the state, which will trigger a change in react-router. Additionally, if you want to respond to the path update action, just handle the `UPDATE_PATH` constant that we provide:

```js
import { UPDATE_PATH } from 'redux-simple-router'

function update(state, action) {
  switch(action.type) {
  case UPDATE_PATH:
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

_Have an example to add? Send us a PR!_

### API

#### `syncReduxAndRouter(history, store, selectRouterState?)`

Call this with a react-router and a redux store instance to install hooks that always keep both of them in sync. When one changes, so will the other.

Supply an optional function `selectRouterState` to customize where to find the router state on your app state. It defaults to `state => state.routing`, so you would install the reducer under the name "routing". Feel free to change this to whatever you like.

#### `routeReducer`

A reducer function that keeps track of the router state. You must to add this reducer to your app reducers when creating the store. If you do not provide a custom `selectRouterState` function, the piece of state must be named `routing`.

#### `UPDATE_PATH`

An action type that you can listen for in your reducers to be notified of route updates.

#### `pushPath(path, state, { avoidRouterUpdate = false } = {})`

An action creator that you can use to update the current URL and update the browser history. Just pass it a string like `/foo/bar?param=5` as the `path` argument.

You can optionally pass a state to this action creator to update the state of the current route.

The `avoidRouterUpdate`, if `true`, will stop react-router from reacting to this URL change. This is useful if replaying snapshots while using the `forceRefresh` option of the browser history which forces full reloads. It's a rare edge case.

#### `replacePath(path, state, { avoidRouterUpdate = false } = {})`

An action creator that you can use to replace the current URL without updating the browser history.

The `state` and the `avoidRouterUpdate` parameters work just like `pushPath`.
