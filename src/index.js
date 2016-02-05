export {
  UPDATE_LOCATION,
  push, replace, go, goBack, goForward,
  routeActions
} from './actions'

export routerMiddleware from './middleware'

export { LOCATION_CHANGE, routerReducer, syncHistoryWithStore } from './sync'
