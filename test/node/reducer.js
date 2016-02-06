/* eslint-env mocha */

import expect from 'expect'

import { LOCATION_CHANGE, routerReducer } from '../../src/reducer'

describe('routerReducer', () => {
  const state = {
    locationBeforeTransitions: {
      pathname: '/foo',
      action: 'POP'
    }
  }

  it('updates the path', () => {
    expect(routerReducer(state, {
      type: LOCATION_CHANGE,
      payload: {
        path: '/bar',
        action: 'PUSH'
      }
    })).toEqual({
      locationBeforeTransitions: {
        path: '/bar',
        action: 'PUSH'
      }
    })
  })

  it('works with initialState', () => {
    expect(routerReducer(undefined, {
      type: LOCATION_CHANGE,
      payload: {
        path: '/bar',
        action: 'PUSH'
      }
    })).toEqual({
      locationBeforeTransitions: {
        path: '/bar',
        action: 'PUSH'
      }
    })
  })


  it('respects replace', () => {
    expect(routerReducer(state, {
      type: LOCATION_CHANGE,
      payload: {
        path: '/bar',
        action: 'REPLACE'
      }
    })).toEqual({
      locationBeforeTransitions: {
        path: '/bar',
        action: 'REPLACE'
      }
    })
  })
})
