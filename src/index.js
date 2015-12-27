// Constants

export const UPDATE_PATH = '@@router/UPDATE_PATH'
const SELECT_STATE = state => state.routing

export function pushPath(path, state, key) {
  return {
    type: UPDATE_PATH,
    payload: { path, state, key, replace: false }
  }
}

export function replacePath(path, state, key) {
  return {
    type: UPDATE_PATH,
    payload: { path, state, key, replace: true }
  }
}

// Reducer

let initialState = {
  path: undefined,
  state: undefined,
  replace: false,
  key: undefined
}

export function routeReducer(state=initialState, { type, payload }) {
  if(type === UPDATE_PATH) {
    return payload
  }

  return state
}

// Syncing
function createPath(location) {
  const { pathname, search, hash } = location
  let result = pathname
  if (search)
    result += search
  if (hash)
    result += hash
  return result
}

export function syncHistory(history) {
  let unsubscribeHistory, currentKey, unsubscribeStore
  let connected = false

  function middleware(store) {
    unsubscribeHistory = history.listen(location => {
      const path = createPath(location)
      const { state, key } = location
      currentKey = key

      const method = location.action === 'REPLACE' ? replacePath : pushPath
      store.dispatch(method(path, state, key))
    })

    connected = true

    return next => action => {
      if (action.type !== UPDATE_PATH) {
        next(action)
        return
      }

      const { payload } = action
      if (payload.key || !connected) {
        // Either this came from the history, or else we're not forwarding
        // location actions to history.
        next(action)
        return
      }

      const { replace, state, path } = payload
      // FIXME: ???! `path` and `pathname` are _not_ synonymous.
      const method = replace ? 'replaceState' : 'pushState'

      history[method](state, path)
    }
  }

  middleware.syncHistoryToStore =
    (store, selectRouterState = SELECT_STATE) => {
      const getRouterState = () => selectRouterState(store.getState())
      const {
        key: initialKey, state: initialState, path: initialPath
      } = getRouterState()

      unsubscribeStore = store.subscribe(() => {
        let { key, state, path } = getRouterState()

        // If we're resetting to the beginning, use the saved values.
        if (key === undefined) {
          key = initialKey
          state = initialState
          path = initialPath
        }

        if (key !== currentKey) {
          history.pushState(state, path)
        }
      })
    }

  middleware.unsubscribe = () => {
    unsubscribeHistory()
    if (unsubscribeStore) {
      unsubscribeStore()
    }

    connected = false
  }

  return middleware
}
