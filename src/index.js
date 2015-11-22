
// constants

const UPDATE_PATH = "@@router/UPDATE_PATH";
const SELECT_STATE = state => state.routing;

// Action creator

function updatePath(path, noRouterUpdate) {
  return {
    type: UPDATE_PATH,
    path: path,
    noRouterUpdate: noRouterUpdate
  }
}

// Reducer

const initialState = typeof window === 'undefined' ? {} : {
  path: locationToString(window.location)
};

function update(state=initialState, action) {
  if(action.type === UPDATE_PATH) {
    return Object.assign({}, state, {
      path: action.path,
      noRouterUpdate: action.noRouterUpdate
    });
  }
  return state;
}

// Syncing

function locationToString(location) {
  return location.pathname + location.search + location.hash;
}

function syncReduxAndRouter(history, store, selectRouterState = SELECT_STATE) {
  let isTransitioning = false;
  let currentLocation;
  const getRouterState = () => selectRouterState(store.getState());

  if(!getRouterState()) {
    throw new Error(
      "Cannot sync router: route state does not exist. Did you " +
      "install the routing reducer?"
    );
  }

  const unsubscribeHistory = history.listen(location => {
    currentLocation = location;
    isTransitioning = false;

    // Avoid dispatching an action if the store is already up-to-date,
    // even if `history` wouldn't do anything if the location is the same
    if(getRouterState().path !== locationToString(location)) {
      store.dispatch(updatePath(newLocation));
    }
  });

  const unsubscribeStore = store.subscribe(() => {
    const routing = getRouterState();

    // Don't update the router if they are already in sync, or if
    // we've already triggered an update for this path. The latter can
    // happen if any state changes happen during transitions (for
    // example: updating app state during `listenBefore`).
    //
    // The `noRouterUpdate` flag can be set to avoid updating
    // altogether, which is useful for things like loading snapshots
    // or very special edge cases.
    if(!isTransitioning &&
       routing.path !== locationToString(currentLocation) &&
       !routing.noRouterUpdate) {
      isTransitioning = true;
      history.pushState(null, routing.path);
    }
  });

  return function unsubscribe() {
    unsubscribeHistory();
    unsubscribeStore();
  };
}

module.exports = {
  UPDATE_PATH,
  updatePath,
  syncReduxAndRouter,
  routeReducer: update
};
