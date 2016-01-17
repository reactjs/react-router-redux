///
declare module ReduxSimpleRouter {
    import R = Redux;
    import H = HistoryModule;

    const UPDATE_LOCATION: string;

    interface HistoryMiddleware extends R.Middleware {
        syncHistoryToStore(store: R.Store, selectRouterState?: Function): void;
        unsubscribe(): void;
    }

    type LocationDescriptorObject = {
        pathname: H.Pathname;
        search: H.QueryString;
        query: H.Query;
        state: H.LocationState;
    };

    type LocationDescriptor = LocationDescriptorObject | H.Path;

    interface RouteActions {
        push(nextLocation: LocationDescriptor): void;
        replace(nextLocation: LocationDescriptor): void;
        go(n: number): void;
        goForward(): void;
        goBack: void;
    }

    function syncHistory(history: H.History): HistoryMiddleware;
    function routeReducer(): R.Reducer;

    const routeActions: RouteActions;
}

declare module "redux-simple-router" {
    export = ReduxSimpleRouter;
}