
// constants

const UPDATE_PATH = "@@router/UPDATE_PATH";

// Action creator

const updatePath = (path, noRouterUpdate) => ({
  type: UPDATE_PATH,
  path,
  noRouterUpdate
});

// Reducer

const initialState = {};

const update = (state = initialState, { type, path, noRouterUpdate }) => (
  type === UPDATE_PATH
    ? Object.assign({}, state, {
      path,
      noRouterUpdate
    })
    : state
);

// Syncing

const locationToString = (location) => location.pathname + location.search + location.hash;

const syncReduxAndRouter = (history, store) => {
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
    const { routing } = store.getState();
    // Don't update the router if nothing has changed. The
    // `avoidRouterUpdate` flag can be set to avoid updating altogether,
    // which is useful for things like loading snapshots or very special
    // edge cases.
    if(routing.path !== locationToString(window.location) &&
       !routing.noRouterUpdate) {
      history.pushState(null, routing.path);
    }
  });
}

module.exports = {
  UPDATE_PATH,
  updatePath,
  syncReduxAndRouter,
  routeReducer: update,
};
