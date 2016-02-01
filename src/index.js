// Constants

export const TRANSITION = '@@router/TRANSITION'
export const UPDATE_LOCATION = '@@router/UPDATE_LOCATION'

const SELECT_LOCATION = state => state.routing.location

function transition(method) {
  return (...args) => ({
    type: TRANSITION,
    payload: { method, args }
  })
}

export const push = transition('push')
export const replace = transition('replace')
export const go = transition('go')
export const goBack = transition('goBack')
export const goForward = transition('goForward')

export const routeActions = { push, replace, go, goBack, goForward }

function updateLocation(location) {
  return {
    type: UPDATE_LOCATION,
    payload: location
  }
}

// Reducer

const initialState = {
  location: undefined
}

export function routeReducer(state = initialState, { type, payload: location }) {
  if (type !== UPDATE_LOCATION) {
    return state
  }

  return { ...state, location }
}

// Syncing

export function syncHistory(history) {
  let unsubscribeHistory, currentKey, unsubscribeStore
  let connected = false, syncing = false

  history.listen(location => { initialState.location = location })()

  function middleware(store) {
    unsubscribeHistory = history.listen(location => {
      currentKey = location.key
      if (syncing) {
        // Don't dispatch a new action if we're replaying location.
        return
      }

      store.dispatch(updateLocation(location))
    })

    connected = true

    return next => action => {
      if (action.type !== TRANSITION || !connected) {
        return next(action)
      }

      const { payload: { method, args } } = action
      history[method](...args)
    }
  }

  middleware.listenForReplays =
    (store, selectLocationState = SELECT_LOCATION) => {
      const getLocationState = () => selectLocationState(store.getState())
      const initialLocation = getLocationState()

      unsubscribeStore = store.subscribe(() => {
        const location = getLocationState()

        // If we're resetting to the beginning, use the saved initial value. We
        // need to dispatch a new action at this point to populate the store
        // appropriately.
        if (!location) {
          history.transitionTo(initialLocation)
          return
        }

        // Otherwise, if we need to update the history location, do so without
        // dispatching a new action, as we're just bringing history in sync
        // with the store.
        if (location.key !== currentKey) {
          syncing = true
          history.transitionTo(location)
          syncing = false
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
