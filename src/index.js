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

export function syncHistory(history, {
  urlToState = false,
  stateToUrl = false,
  selectLocationState = SELECT_LOCATION
} = {}) {
  if (!urlToState && !stateToUrl) {
    return createStore => createStore
  }

  history.listen(location => { initialState.location = location })()

  let currentKey, syncing = false
  let unsubscribeStore, unsubscribeHistory

  const updateStoreOnHistoryChange = (store) => {
    unsubscribeHistory = history.listen(location => {
      currentKey = location.key
      if (syncing) {
        // Don't dispatch a new action if we're replaying location.
        return
      }

      store.dispatch(updateLocation(location))
    })
  }
  const updateHistoryOnStoreChange = (store) => {
    const getLocationState = () => selectLocationState(store.getState())
    const initialLocation = getLocationState()

    const reconcileLocationWithState = () => {
      const location = getLocationState()

      // If we're resetting to the beginning, use the saved initial value. We
      // need to dispatch a new action at this point to populate the store
      // appropriately.
      if (location.key === initialLocation.key) {
        history.replace(initialLocation)
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
    }

    reconcileLocationWithState()
    unsubscribeStore = store.subscribe(reconcileLocationWithState)
  }

  const enhancer = createStore => (reducer, initialState, enhancer) => {
    const store = createStore(reducer, initialState, enhancer)
    const { dispatch: originalDispatch } = store

    const dispatch = (action) => {
      if (action.type !== TRANSITION || !unsubscribeHistory) {
        return originalDispatch(action)
      }

      const { payload: { method, args } } = action
      history[method](...args)
    }

    if (stateToUrl) {
      updateHistoryOnStoreChange(store)
    }

    if (urlToState) {
      updateStoreOnHistoryChange(store)
    }

    return {
      ...store,
      dispatch
    }
  }

  enhancer.dispose = () => {
    if (unsubscribeStore) {
      unsubscribeStore()
      unsubscribeStore = null
    }

    if (unsubscribeHistory) {
      unsubscribeHistory()
      unsubscribeHistory = null
    }
  }

  return enhancer
}
