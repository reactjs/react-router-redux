
// constants

const UPDATE_PATH = "@@router/UPDATE_PATH";

// Action creator

function updatePath(path) {
  return {
    type: UPDATE_PATH,
    path: path
  }
}

// Reducer

const initialState = {};
function update(state=initialState, action) {
  if(action.type === UPDATE_PATH) {
    return Object.assign({}, state, { path: action.path });
  }
  return state;
}

// Syncing

function locationToString(location) {
  return location.pathname +
    (location.search ? ('?' + location.search) : '') +
    (location.hash ? ('#' + location.hash) : '');
}

function syncReduxAndRouter(history, store) {
  if(!store.getState().routing) {
    throw new Error(
      "Cannot sync router: route state does not exist. Did you " +
      "install the reducer under the name `routing`?"
    );
  }

  history.listen(location => {
    // Avoid dispatching an action if the store is already up-to-date,
    // even if `history` wouldn't do anthing if the location is the same
    if(store.getState().routing.path !== locationToString(location)) {
      store.dispatch(updatePath(locationToString(location)));
    }
  });

  store.subscribe(() => {
    const routing = store.getState().routing;
    // Don't update the router is nothing has changed. The
    // `avoidRouterUpdate` flag can be set to avoid updating altogether,
    // which is useful for things like loading snapshots or very special
    // edge cases.
    if(routing.path !== locationToString(window.location) &&
       !routing.noRouterUpdate) {
      history.pushState(null, routeState.path);
    }
  });
}

module.exports = {
  UPDATE_PATH,
  updatePath,
  syncReduxAndRouter,
  routeReducer: update,
};
