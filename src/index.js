// Constants

export const TRANSITION = '@@router/TRANSITION'
export const UPDATE_LOCATION = '@@router/UPDATE_LOCATION'

const SELECT_STATE = state => state.routing

function transition(method) {
  return arg => ({
    type: TRANSITION,
    method, arg
  })
}

export const routeActions = {
  push: transition('push'),
  replace: transition('replace'),
  go: transition('go'),
  goBack: transition('goBack'),
  goForward: transition('goForward')
}

function updateLocation(location) {
  return {
    type: UPDATE_LOCATION,
    location
  }
}

// Reducer

const initialState = {
  location: undefined
}

export function routeReducer(state = initialState, { type, location }) {
  if (type !== UPDATE_LOCATION) {
    return state
  }

  return { location }
}

// Syncing

export function syncHistory(history) {
  let unsubscribeHistory, currentKey, unsubscribeStore
  let connected = false, syncing = false

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

      const { method, arg } = action
      history[method](arg)
    }
  }

  middleware.syncHistoryToStore =
    (store, selectRouterState = SELECT_STATE) => {
      const getRouterState = () => selectRouterState(store.getState())
      const { location: initialLocation } = getRouterState()

      unsubscribeStore = store.subscribe(() => {
        const { location } = getRouterState()

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
