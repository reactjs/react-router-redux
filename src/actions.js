/**
 * This action type will be dispatched by the history actions below.
 * If you're writing a middleware to watch for navigation events, be sure to
 * look for actions of this type.
 */
export const UPDATE_LOCATION = '@@router/UPDATE_LOCATION'

function updateLocation(method) {
  return (...args) => ({
    type: UPDATE_LOCATION,
    payload: { method, args }
  })
}

/**
 * These actions correspond to the history API.
 * The associated routerMiddleware will capture these events before they get to
 * your reducer and reissue them as the matching function on your history.
 */
export const push = updateLocation('push')
export const replace = updateLocation('replace')
export const go = updateLocation('go')
export const goBack = updateLocation('goBack')
export const goForward = updateLocation('goForward')

export const routeActions = { push, replace, go, goBack, goForward }
