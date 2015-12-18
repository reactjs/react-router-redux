import deepEqual from 'deep-equal'

// Constants

const INIT_PATH = '@@router/INIT_PATH'
export const UPDATE_PATH = '@@router/UPDATE_PATH'
const SELECT_STATE = state => state.routing

// Action creators

function initPath(path, state) {
  return {
    type: INIT_PATH,
    payload: {
      path: path,
      state: state,
      replace: false
    }
  }
}

export function pushPath(path, state) {
  return {
    type: UPDATE_PATH,
    payload: {
      path: path,
      state: state,
      replace: false
    }
  }
}

export function replacePath(path, state) {
  return {
    type: UPDATE_PATH,
    payload: {
      path: path,
      state: state,
      replace: true
    }
  }
}

// Reducer

let initialState = {
  changeId: 1,
  path: undefined,
  state: undefined,
  replace: false
}

function update(state=initialState, { type, payload }) {
  if(type === INIT_PATH || type === UPDATE_PATH) {
    return Object.assign({}, state, {
      path: payload.path,
      changeId: state.changeId + 1,
      state: payload.state,
      replace: payload.replace
    })
  }
  return state
}

// Syncing

function locationsAreEqual(a, b) {
  return a != null && b != null && a.path === b.path && deepEqual(a.state, b.state)
}

function createPath(location) {
  const { pathname, search, hash } = location
  let result = pathname
  if (search)
    result += search
  if (hash)
    result += hash
  return result
}

export function syncReduxAndRouter(history, store, selectRouterState = SELECT_STATE) {
  const getRouterState = () => selectRouterState(store.getState())

  // To properly handle store updates we need to track the last route.
  // This route contains a `changeId` which is updated on every
  // `pushPath` and `replacePath`. If this id changes we always
  // trigger a history update. However, if the id does not change, we
  // check if the location has changed, and if it is we trigger a
  // history update. It's possible for this to happen when something
  // reloads the entire app state such as redux devtools.
  let lastRoute = undefined
  let avoidRouterUpdate = false;

  if(!getRouterState()) {
    throw new Error(
      'Cannot sync router: route state does not exist. Did you ' +
      'install the routing reducer?'
    )
  }

  const unsubscribeStore = store.subscribe(() => {
    let routing = getRouterState()

    // Only trigger history update if this is a new change or the
    // location has changed.
    if(lastRoute !== routing && !avoidRouterUpdate) {
      lastRoute = routing;
      const method = routing.replace ? 'replaceState' : 'pushState'
      history[method](routing.state, routing.path)
    }

    avoidRouterUpdate = false;
  })


  const unsubscribeHistory = history.listen(location => {
    const route = {
      path: createPath(location),
      state: location.state
    }

    if(!locationsAreEqual(getRouterState(), route)) {
      // The above check avoids dispatching an action if the store is
      // already up-to-date

      if(!lastRoute) {
        initialState = {
          changeId: 1,
          path: route.path,
          state: route.state,
          replace: false
        }

        // TODO: temporary hack only so that we don't set the
        // initialState again. This is not needed for anything else.
        // We should re-think in generate how to solve the initial
        // state problem.
        lastRoute = route
      }

      avoidRouterUpdate = true;
      const method = location.action === 'REPLACE' ? replacePath : pushPath
      store.dispatch(method(route.path, route.state))
    }
  })

  return function unsubscribe() {
    unsubscribeHistory()
    unsubscribeStore()
  }
}

export { update as routeReducer }
