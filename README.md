# react-router-redux [![npm package][npm-badge]][npm] [![npm downloads][npm-downloads]][npm] [![Travis][build-badge]][build]

[build-badge]: https://img.shields.io/travis/reactjs/react-router-redux/master.svg?style=flat-square
[build]: https://travis-ci.org/reactjs/react-router-redux

[npm-badge]: https://img.shields.io/npm/v/react-router-redux.svg?style=flat-square
[npm-downloads]: https://img.shields.io/npm/dm/react-router-redux.svg?style=flat-square
[npm]: https://www.npmjs.org/package/react-router-redux

> Keep React Router in sync with Redux

## Installation

Using [npm](https://www.npmjs.com/):

    npm install --save react-router-redux

A UMD build is also available on [unpkg](https://unpkg.com):

```html
<script src="https://unpkg.com/react-router-redux/umd/react-router-redux.min.js"></script>
```

## Usage

Let's take a look at a simple example.

```js
import React from 'react'
import ReactDOM from 'react-dom'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'
import { Match } from 'react-router'
import { ConnectedRouter, routerReducer } from 'react-router-redux'

import reducers from '<project-path>/reducers'
import App from '<project-path>/components/App'

// Add the reducer to your store on the `router` key
const store = createStore(
  combineReducers({
    ...reducers,
    router: routerReducer
  })
)

ReactDOM.render(
  <Provider store={store}>
    { /* Use the ConnectedRouter inside of Provider */ }
    <ConnectedRouter>
      <Match pattern="/" component={App}/>
    </ConnectedRouter>
  </Provider>,
  document.getElementById('root')
)
```

The location will automatically be synced with `state.router.location`. You can also access the last action type with `state.router.action`.

## TODOs

- Action creators to issue navigation events (`dispatch(push('/foo'))`)
- More and better tests
