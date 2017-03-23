import syncHistoryWithStore from './sync'
import { LOCATION_CHANGE, routerReducer } from './reducer'
import {
  CALL_HISTORY_METHOD,
  push, replace, go, goBack, goForward,
  routerActions
} from './actions'
import routerMiddleware from './middleware'

export {
  syncHistoryWithStore,
  LOCATION_CHANGE, routerReducer,
  CALL_HISTORY_METHOD, push, replace, go, goBack, goForward, routerActions,
  routerMiddleware
}
