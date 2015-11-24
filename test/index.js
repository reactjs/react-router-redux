const expect = require('expect');
const { updatePath, UPDATE_PATH, routeReducer, syncReduxAndRouter } = require('../src/index');
const { createStore, combineReducers } = require('redux');
const { createMemoryHistory: createHistory } = require('history');

function createSyncedHistoryAndStore() {
  const store = createStore(combineReducers({
    routing: routeReducer
  }));
  const history = createHistory();
  syncReduxAndRouter(history, store);
  return { history, store };
}

describe('updatePath', () => {
  it('creates actions', () => {
    expect(updatePath('/foo')).toEqual({
      type: UPDATE_PATH,
      path: '/foo',
      avoidRouterUpdate: false
    });

    expect(updatePath('/foo', { avoidRouterUpdate: true })).toEqual({
      type: UPDATE_PATH,
      path: '/foo',
      avoidRouterUpdate: true
    });
  });
});

describe('routeReducer', () => {
  const state = {
    path: '/foo',
    changeId: 1
  };

  it('updates the path', () => {
    expect(routeReducer(state, {
      type: UPDATE_PATH,
      path: '/bar'
    })).toEqual({
      path: '/bar',
      changeId: 2
    });
  });

  it('respects `avoidRouterUpdate` flag', () => {
    expect(routeReducer(state, {
      type: UPDATE_PATH,
      path: '/bar',
      avoidRouterUpdate: true
    })).toEqual({
      path: '/bar',
      changeId: 1
    });
  });
});

describe('syncReduxAndRouter', () => {
  it('syncs router -> redux', () => {
    const { history, store } = createSyncedHistoryAndStore();
    expect(store.getState().routing.path).toEqual('/');

    history.pushState(null, '/foo');
    expect(store.getState().routing.path).toEqual('/foo');

    history.pushState(null, '/bar');
    expect(store.getState().routing.path).toEqual('/bar');

    history.pushState(null, '/bar?query=1');
    expect(store.getState().routing.path).toEqual('/bar?query=1');

    history.pushState(null, '/bar?query=1#hash=2');
    expect(store.getState().routing.path).toEqual('/bar?query=1#hash=2');
  });

  it('syncs redux -> router', () => {
    const { history, store } = createSyncedHistoryAndStore();
    expect(store.getState().routing).toEqual({
      path: '/',
      changeId: 1
    });

    store.dispatch(updatePath('/foo'));
    expect(store.getState().routing).toEqual({
      path: '/foo',
      changeId: 2
    });

    store.dispatch(updatePath('/bar'));
    expect(store.getState().routing).toEqual({
      path: '/bar',
      changeId: 3
    });

    store.dispatch(updatePath('/bar?query=1'));
    expect(store.getState().routing).toEqual({
      path: '/bar?query=1',
      changeId: 4
    });

    store.dispatch(updatePath('/bar?query=1#hash=2'));
    expect(store.getState().routing).toEqual({
      path: '/bar?query=1#hash=2',
      changeId: 5
    });
  });

  it('updates the router even if path is the same', () => {
    const { history, store } = createSyncedHistoryAndStore();
    expect(store.getState().routing).toEqual({
      path: '/',
      changeId: 1
    });

    store.dispatch(updatePath('/foo'));
    expect(store.getState().routing).toEqual({
      path: '/foo',
      changeId: 2
    });

    store.dispatch(updatePath('/foo'));
    expect(store.getState().routing).toEqual({
      path: '/foo',
      changeId: 3
    });
  });

  it('does not update the router for other state changes', () => {
    const { history, store } = createSyncedHistoryAndStore();
    store.dispatch({
      type: 'RANDOM_ACTION',
      value: 5
    });

    expect(store.getState().routing).toEqual({
      path: '/',
      changeId: 1
    });
  });

  it('only updates the router once when dispatching from `listenBefore`', () => {
    const { history, store } = createSyncedHistoryAndStore();
    expect(store.getState().routing).toEqual({
      path: '/',
      changeId: 1
    });

    history.listenBefore(location => {
      expect(location.pathname).toEqual('/foo');
      store.dispatch({
        type: 'RANDOM_ACTION',
        value: 5
      });
    });

    store.dispatch(updatePath('/foo'));
    expect(store.getState().routing).toEqual({
      path: '/foo',
      changeId: 2
    });
  });

  it('allows updating the route from within `listenBefore`', () => {
    const { history, store } = createSyncedHistoryAndStore();
    expect(store.getState().routing).toEqual({
      path: '/',
      changeId: 1
    });

    history.listenBefore(location => {
      if(location.pathname === '/foo') {
        expect(store.getState().routing).toEqual({
          path: '/foo',
          changeId: 2
        });
        store.dispatch(updatePath('/bar'));
      }
    });

    store.dispatch(updatePath('/foo'));
    expect(store.getState().routing).toEqual({
      path: '/bar',
      changeId: 3
    });
  })

  it('throws if "routing" key is missing with default selectRouteState', () => {
    const store = createStore(combineReducers({
      notRouting: routeReducer
    }));
    const history = createHistory();
    expect(
      () => syncReduxAndRouter(history, store)
    ).toThrow(/Cannot sync router: route state does not exist/);
  });
});
