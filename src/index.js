const deepEqual = require('deep-equal');

// Constants

const UPDATE_PATH = "@@router/UPDATE_PATH";
const SELECT_STATE = state => state.routing;

// Action creator

function pushPath(path, state, { avoidRouterUpdate = false } = {}) {
  return {
    type: UPDATE_PATH,
    payload: {
      path: path,
      state: state,
      replace: false,
      avoidRouterUpdate: !!avoidRouterUpdate
    }
  };
}

function replacePath(path, state, { avoidRouterUpdate = false } = {}) {
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

const initialState = {
  changeId: 1,
  path: undefined,
  state: undefined,
  replace: false
};

function update(state=initialState, { type, payload }) {
  if(type === UPDATE_PATH) {
    return Object.assign({}, state, {
      path: payload.path,
      changeId: state.changeId + (payload.avoidRouterUpdate ? 0 : 1),
      state: payload.state,
      replace: payload.replace
    });
  }
  return state;
}

// Syncing

function locationsAreEqual(a, b) {
  return a != null && b != null && a.path === b.path && deepEqual(a.state, b.state);
}

function syncReduxAndRouter(history, store, selectRouterState = SELECT_STATE) {
  const getRouterState = () => selectRouterState(store.getState());

  // Because we're not able to set the initial path in `initialState` we need a
  // "hack" to get "Revert" in Redux DevTools to work. We solve this by keeping
  // the first route so we can revert to this route when the initial state is
  // replayed to reset the state. Basically, we treat the first route as our
  // initial state.
  let firstRoute = undefined;

  // To properly handle store updates we need to track the last route. This
  // route contains a `changeId` which is updated on every `pushPath` and
  // `replacePath`. If this id changes we always trigger a history update.
  // However, if the id does not change, we check if the location has changed,
  // and if it is we trigger a history update. (If these are out of sync it's
  // likely because of React DevTools.)
  let lastRoute = undefined;

  if(!getRouterState()) {
    throw new Error(
      "Cannot sync router: route state does not exist. Did you " +
      "install the routing reducer?"
    );
  }

  const unsubscribeHistory = history.listen(location => {
    const route = {
      path: history.createPath(location),
      state: location.state
    };

    if (firstRoute === undefined) {
      firstRoute = route;
    }

    // Avoid dispatching an action if the store is already up-to-date,
    // even if `history` wouldn't do anything if the location is the same
    if(locationsAreEqual(getRouterState(), route)) return;

    const updatePath = location.action === 'REPLACE'
      ? replacePath
      : pushPath;

    store.dispatch(updatePath(route.path, route.state, { avoidRouterUpdate: true }));
  });

  const unsubscribeStore = store.subscribe(() => {
    let routing = getRouterState();

    // Treat `firstRoute` as our `initialState`
    if(routing === initialState) {
      routing = firstRoute;
    }

    // Only trigger history update is this is a new change or the location
    // has changed.
    if(lastRoute === undefined ||
      lastRoute.changeId === routing.changeId &&
      locationsAreEqual(lastRoute, routing)) {
      return;
    }

    lastRoute = routing;

    const method = routing.replace ? 'replaceState' : 'pushState';

    history[method](routing.state, routing.path);
  });

  return function unsubscribe() {
    unsubscribeHistory();
    unsubscribeStore();
  };
}

module.exports = {
  UPDATE_PATH,
  pushPath,
  replacePath,
  syncReduxAndRouter,
  routeReducer: update
};
