import deepEqual from 'deep-equal'

// Constants

export const UPDATE_PATH = '@@router/UPDATE_PATH'
const SELECT_STATE = state => state.routing

export function pushPath(path, state, { avoidRouterUpdate = false } = {}) {
  return {
    type: UPDATE_PATH,
    payload: {
      path: path,
      state: state,
      replace: false,
      avoidRouterUpdate: !!avoidRouterUpdate
    }
  }
}

export function replacePath(path, state, { avoidRouterUpdate = false } = {}) {
  return {
    type: UPDATE_PATH,
    payload: {
      path: path,
      state: state,
      replace: true,
      avoidRouterUpdate: !!avoidRouterUpdate
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
  if(type === UPDATE_PATH) {
    return Object.assign({}, state, {
      path: payload.path,
      changeId: state.changeId + (payload.avoidRouterUpdate ? 0 : 1),
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

  if(!getRouterState()) {
    throw new Error(
      'Cannot sync router: route state does not exist. Did you ' +
      'install the routing reducer?'
    )
  }

  const unsubscribeHistory = history.listen(location => {
    const route = {
      path: createPath(location),
      state: location.state
    }

    if (!lastRoute) {
      // `initialState` *should* represent the current location when
      // the app loads, but we cannot get the current location when it
      // is defined. What happens is `history.listen` is called
      // immediately when it is registered, and it updates the app
      // state with an UPDATE_PATH action. This causes problem when
      // users are listening to UPDATE_PATH actions just for
      // *changes*, and with redux devtools because "revert" will use
      // `initialState` and it won't revert to the original URL.
      // Instead, we specialize the first route notification and do
      // different things based on it.
      initialState = {
        changeId: 1,
        path: route.path,
        state: route.state,
        replace: false
      }

      // Also set `lastRoute` so that the store subscriber doesn't
      // trigger an unnecessary `pushState` on load
      lastRoute = initialState

      store.dispatch(pushPath(route.path, route.state, { avoidRouterUpdate: true }));
    } else if(!locationsAreEqual(getRouterState(), route)) {
      // The above check avoids dispatching an action if the store is
      // already up-to-date
      const method = location.action === 'REPLACE' ? replacePath : pushPath
      store.dispatch(method(route.path, route.state, { avoidRouterUpdate: true }))
    }
  })

  const unsubscribeStore = store.subscribe(() => {
    let routing = getRouterState()

    // Only trigger history update if this is a new change or the
    // location has changed.
    if(lastRoute.changeId !== routing.changeId ||
       !locationsAreEqual(lastRoute, routing)) {

      lastRoute = routing
      const method = routing.replace ? 'replaceState' : 'pushState'
      history[method](routing.state, routing.path)
    }

  })

  return function unsubscribe() {
    unsubscribeHistory()
    unsubscribeStore()
  }
}

export { update as routeReducer }
