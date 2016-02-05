import UPDATE_LOCATION from './actions'

/**
 * This middleware captures UPDATE_LOCATION actions to redirect to the
 * provided history object. This will prevent these actions from reaching your
 * reducer or any middleware that comes after this one.
 */
export default function routerMiddleware(history) {
  return () => next => action => {
    if (action.type !== UPDATE_LOCATION) {
      return next(action)
    }

    const { payload: { method, args } } = action
    history[method](...args)
  }
}
