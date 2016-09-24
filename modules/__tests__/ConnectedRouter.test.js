import React from 'react'
import { renderToString } from 'react-dom/server'
import { createStore, combineReducers } from 'redux'
import { Provider } from 'react-redux'

import MemoryHistory from 'react-history/MemoryHistory'
import Match from 'react-router/Match'

import { ConnectedRouter, routerReducer } from '../'

describe('ConnectedRouter', () => {
  let store

  beforeEach(() => {
    store = createStore(combineReducers({
      router: routerReducer
    }))
  })

  it('sets the initial state in the store', () =>{
    const html = renderToString(
      <ConnectedRouter store={store} history={MemoryHistory} location="/foo">
        <Match pattern="/foo" render={() => (<div>Matched!</div>)}/>
      </ConnectedRouter>
    )

    const { router: { location, action } } = store.getState()

    expect(html).toContain('Matched!')

    expect(location.pathname).toBe('/')
    expect(action).toBe('POP')
  })

  it('works with a store on from Provider', () =>{
    const html = renderToString(
      <Provider store={store}>
        <ConnectedRouter history={MemoryHistory} location="/foo">
          <Match pattern="/foo" render={() => (<div>Matched!</div>)}/>
        </ConnectedRouter>
      </Provider>
    )

    const { router: { location, action } } = store.getState()

    expect(html).toContain('Matched!')

    expect(location.pathname).toBe('/')
    expect(action).toBe('POP')
  })
})
