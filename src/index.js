
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
  let lastRoute;
  const getRouterState = () => selectRouterState(store.getState());

  if(!getRouterState()) {
    throw new Error(
      "Cannot sync router: route state does not exist. Did you " +
      "install the routing reducer?"
    );
  }

  const unsubscribeHistory = history.listen(location => {
    const newLocation = locationToString(location);
    // Avoid dispatching an action if the store is already up-to-date,
    // even if `history` wouldn't do anything if the location is the same
    if(getRouterState().path !== newLocation) {
      lastRoute = newLocation;
      store.dispatch(updatePath(newLocation));
    }
  });

  const unsubscribeStore = store.subscribe(() => {
    const routing = getRouterState();

    // Don't update the router if the routing state hasn't changed or the new routing path
    // is already the current location.
    // The `noRouterUpdate` flag can be set to avoid updating altogether,
    // which is useful for things like loading snapshots or very special
    // edge cases.
    if(lastRoute !== routing.path && routing.path !== locationToString(window.location) &&
       !routing.noRouterUpdate) {
      lastRoute = routing.path;
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
