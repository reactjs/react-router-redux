const deepEqual = require('deep-equal');

// Constants

const UPDATE_PATH = "@@router/UPDATE_PATH";
const SELECT_STATE = state => state.routing;

// Action creator

function pushPath(path, state, { avoidRouterUpdate = false } = {}) {
  return {
    type: UPDATE_PATH,
    path: path,
    state: state,
    replace: false,
    avoidRouterUpdate: !!avoidRouterUpdate
  };
}

function replacePath(path, state, { avoidRouterUpdate = false } = {}) {
  return {
    type: UPDATE_PATH,
    path: path,
    state: state,
    replace: true,
    avoidRouterUpdate: !!avoidRouterUpdate
  }
}

// Reducer

const initialState = {
  changeId: 1,
  path: undefined,
  state: undefined,
  replace: false
};

function update(state=initialState, action) {
  if(action.type === UPDATE_PATH) {
    return Object.assign({}, state, {
      path: action.path,
      changeId: state.changeId + (action.avoidRouterUpdate ? 0 : 1),
      state: action.state,
      replace: action.replace
    });
  }
  return state;
}

// Syncing

function locationsAreEqual(a, b) {
  return a.path === b.path && deepEqual(a.state, b.state);
}

function syncReduxAndRouter(history, store, selectRouterState = SELECT_STATE) {
  const getRouterState = () => selectRouterState(store.getState());
  let lastChangeId = 0;

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

    // Avoid dispatching an action if the store is already up-to-date,
    // even if `history` wouldn't do anything if the location is the same
    if(locationsAreEqual(getRouterState(), route)) return;

    const updatePath = location.action === 'REPLACE'
      ? replacePath
      : pushPath;

    store.dispatch(updatePath(route.path, route.state, { avoidRouterUpdate: true }));
  });

  const unsubscribeStore = store.subscribe(() => {
    const routing = getRouterState();

    // Only update the router once per `pushPath` call. This is
    // indicated by the `changeId` state; when that number changes, we
    // should update the history.
    if(lastChangeId === routing.changeId) return;

    lastChangeId = routing.changeId;

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
