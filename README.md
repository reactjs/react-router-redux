# react-router-redux

[![npm version](https://img.shields.io/npm/v/react-router-redux.svg?style=flat-square)](https://www.npmjs.com/package/react-router-redux) [![npm downloads](https://img.shields.io/npm/dm/react-router-redux.svg?style=flat-square)](https://www.npmjs.com/package/react-router-redux) [![build status](https://img.shields.io/travis/rackt/react-router-redux/master.svg?style=flat-square)](https://travis-ci.org/rackt/react-router-redux)

> **Keep your router in sync with application state** :sparkles:

_Formerly known as redux-simple-router_

You're a smart person. You use [Redux](https://github.com/rackt/redux) to manage your application state. You use [React Router](https://github.com/rackt/react-router) to do routing. All is good.

But the two libraries don't coordinate. You want to do time travel with your application state, but React Router doesn't navigate between pages when you replay actions. It controls an important part of application state: the URL.

This library helps you keep that bit of state in sync with your Redux store. We keep a copy of the current location hidden in state. When you rewind your application state with a tool like [Redux DevTools](https://github.com/gaearon/redux-devtools), that state change is propagated to React Router so it can adjust the component tree accordingly. You can jump around in state, rewinding, replaying, and resetting as much as you'd like, and this library will ensure the two stay in sync at all times.

## Installation

```
npm install --save react-router-redux
```

If you want to install the next major version, use `react-router-redux@next`. Run `npm dist-tag ls react-router-redux` to see what `next` is aliased to.

## How It Works

This library allows you to use React Router's APIs as they are documented. And, you can use redux like you normally would, with a single app state. The library simply enhances a history instance to allow it to synchronize any changes it receives into application state.

[history](https://github.com/rackt/history) + `store` ([redux](https://github.com/rackt/redux)) &rarr; [**react-router-redux**](https://github.com/rackt/react-router-redux) &rarr; enhanced [history](https://github.com/rackt/history) &rarr; [react-router](https://github.com/rackt/react-router)

## Tutorial

Let's take a look at a simple example.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers, applyMiddleware } from 'redux'
import { Provider } from 'react-redux'
import { Router, Route, browserHistory } from 'react-router'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'

import reducers from '<project-path>/reducers'

// Add the reducer to your store on the `routing` key
const store = createStore(
  combineReducers({
    ...reducers,
    routing: routerReducer
  })
)

// Create an enhanced history that syncs navigation events with the store
const history = syncHistoryWithStore(browserHistory, store)

ReactDOM.render(
  <Provider store={store}>
    /* Tell the Router to use our enhanced history */
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

Now any time you navigate, which can come from pressing browser buttons or navigating in your application code, the enhanced history will first pass the new location through the Redux store and then on to React Router to update the component tree. If you time travel, it will also pass the new state to React Router to update the component tree again.

#### How do I watch for navigation events, such as for analytics?

Simply listen to the enhanced history via `history.listen`. This takes in a function that will receive a `location` any time the store updates. This includes any time travel activity performed on the store.

```js
const history = syncHistoryWithStore(browserHistory, store)

history.listen(location => analyticsService.track(location.pathname))
```

For other kinds of events in your system, you can use middleware on your Redux store like normal to watch any action that is dispatched to the store.

#### How do I access router state in a container component?

React Router [provides route information via a route component's props](https://github.com/rackt/react-router/blob/latest/docs/Introduction.md#getting-url-parameters). This makes it easy to access them from a container component. When using [react-redux](https://github.com/rackt/react-redux) to `connect()` your components to state, you can access the router's props from the [2nd argument of `mapStateToProps`](https://github.com/rackt/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options):

```js
function mapStateToProps(state, ownProps) {
  return {
    id: ownProps.params.id,
    filter: ownProps.location.query.filter
  };
}
```

#### What if I want to issue navigation events via Redux actions?

React Router provides singleton versions of history (`browserHistory` and `hashHistory`) that you can import and use from anywhere in your application. However, if you prefer Redux style actions, the library also provides a set of action creators and a middleware to capture them and redirect them to your history instance.

```js
import { routerMiddleware, push } from 'react-router-redux'

// Apply the middleware to the store
const middleware = routerMiddleware(browserHistory)
const store = createStore(
  reducers,
  applyMiddleware(middleware)
)

// Dispatch from anywhere like normal.
store.dispatch(push('/foo'))
```

## Examples

- [examples/basic](/examples/basic) - basic reference implementation

Examples from the community:

- None yet, since we just released a new version :smile:

&rarr; _Have an example to add? Send us a PR!_ &larr;

## API

#### `routerReducer()`

**You must add this reducer to your store for syncing to work.**

A reducer function that stores location updates from `history`. If you use `combineReducers`, it should be nested under the `routing` key.

#### `history = syncHistoryWithStore(history, store)`

Creates an enhanced history from the provided history. This history changes `history.listen` to pass all location updates through the provided store first. This ensures if the store is updated either from a navigation event or from a time travel action, such as a replay, the listeners of the enhanced history will stay in sync.

**You must provide the enhanced history to your `<Router>` component.** This ensures your routes stay in sync with your location and your store at the same time.

#### `push(location)`, `replace(location)`, `go(number)`, `goBack()`, `goForward()`

**You must install `routerMiddleware` for these action creators to work.**

Action creators that correspond with the [history methods of the same name](https://github.com/rackt/history/blob/master/docs/GettingStarted.md#navigation). For reference they are defined as follows:

- `push` - Pushes a new location to history, becoming the current location.
- `replace` - Replaces the current location in history.
- `go` - Moves backwards or forwards a relative number of locations in history.
- `goForward` - Moves forward one location. Equivalent to `go(1)`
- `goBack` - Moves backwards one location. Equivalent to `go(-1)`

Both `push` and `replace` take in a [location descriptor](https://github.com/rackt/history/blob/master/docs/Glossary.md#locationdescriptor), which can be an object describing the URL or a plain string URL.

These action creators are also available in one single object as `routerActions`, which can be used as a convenience when using Redux's `bindActionCreators()`.

#### `routerMiddleware(history)`

A middleware you can apply to your Redux `store` to capture dispatched actions created by the action creators. It will redirect those actions to the provided `history` instance.
