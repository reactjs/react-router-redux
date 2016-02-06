/* eslint-env mocha */

import expect from 'expect'

import {
  UPDATE_LOCATION,
  push, replace, go, goBack, goForward
} from '../../src/actions'

describe('routeActions', () => {

  describe('push', () => {
    it('creates actions', () => {
      expect(push('/foo')).toEqual({
        type: UPDATE_LOCATION,
        payload: {
          method: 'push',
          args: [ '/foo' ]
        }
      })

      expect(push({ pathname: '/foo', state: { the: 'state' } })).toEqual({
        type: UPDATE_LOCATION,
        payload: {
          method: 'push',
          args: [ {
            pathname: '/foo',
            state: { the: 'state' }
          } ]
        }
      })

      expect(push('/foo', 'baz', 123)).toEqual({
        type: UPDATE_LOCATION,
        payload: {
          method: 'push',
          args: [ '/foo' , 'baz', 123 ]
        }
      })
    })
  })

  describe('replace', () => {
    it('creates actions', () => {
      expect(replace('/foo')).toEqual({
        type: UPDATE_LOCATION,
        payload: {
          method: 'replace',
          args: [ '/foo' ]
        }
      })

      expect(replace({ pathname: '/foo', state: { the: 'state' } })).toEqual({
        type: UPDATE_LOCATION,
        payload: {
          method: 'replace',
          args: [ {
            pathname: '/foo',
            state: { the: 'state' }
          } ]
        }
      })
    })
  })

  describe('go', () => {
    it('creates actions', () => {
      expect(go(1)).toEqual({
        type: UPDATE_LOCATION,
        payload: {
          method: 'go',
          args: [ 1 ]
        }
      })
    })
  })

  describe('goBack', () => {
    it('creates actions', () => {
      expect(goBack()).toEqual({
        type: UPDATE_LOCATION,
        payload: {
          method: 'goBack',
          args: []
        }
      })
    })
  })

  describe('goForward', () => {
    it('creates actions', () => {
      expect(goForward()).toEqual({
        type: UPDATE_LOCATION,
        payload: {
          method: 'goForward',
          args: []
        }
      })
    })
  })

})
