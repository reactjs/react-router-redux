## [HEAD](https://github.com/rackt/react-router-redux/compare/3.0.0...master)

**A whole new API, with many breaking changes:**

* `UPDATE_LOCATION` is now `CALL_HISTORY_METHOD`.
* `middleware.listenForReplays(store)` is gone. Its functionality is covered by the `adjustUrlOnReplay` boolean option on `syncHistoryWithStore().` The default is true so you can just remove this from your code.

## [3.0.0](https://github.com/rackt/react-router-redux/compare/2.1.0...3.0.0)

Technically, 2.1.0 broke semver. The appropriate @timdorr's have been flogged. So, we're bumping the major version to catch up.

- Fixed Resets in Redux Dev Tools. [3ae8110f](https://github.com/rackt/react-router-redux/commit/3ae8110f)
- Ensure the initialState is set properly. [a00acfd4](https://github.com/rackt/react-router-redux/commit/a00acfd4)
- Support any number of args on action creators [524898b5](https://github.com/rackt/react-router-redux/commit/524898b5)

## [2.1.0](https://github.com/rackt/react-router-redux/compare/2.0.4...2.1.0)

- `listenForReplays` has a `selectLocationState` selector. [#218](https://github.com/rackt/react-router-redux/pull/218)
- Provide unscoped action creators. [#225](https://github.com/rackt/react-router-redux/pull/225)
- Example updated to use fully ES2015 syntax.

## [2.0.4](https://github.com/rackt/react-router-redux/compare/2.0.2...2.0.4)

- Remove `history` module published within the tarball. [#133](https://github.com/rackt/react-router-redux/issues/133)
- Make actions conform to [Flux Standard Action](https://github.com/acdlite/flux-standard-action). [#208](https://github.com/rackt/react-router-redux/pull/208)

## [2.0.2](https://github.com/rackt/react-router-redux/compare/1.0.2...2.0.2)

Versions 2.0.0 and 2.0.1 were test releases for the 2.* series. 2.0.2 is the first public release.

**A whole new API, with many breaking changes:**

* `syncReduxAndRouter` is gone. Instead, call `syncHistory` with just the `history` object, which returns a middleware that you need to apply. (#141)
* If you use redux devtools, you need to call `middleware.listenForReplays(store)` on the middleware returned from `syncHistory`. Create the store first with the middleware, then call this function with the store.
* Action creators are now contained in a single object called `routeActions`. `go`, `goBack`, and `goForward` action creators have been added.
* `UPDATE_PATH` is now `UPDATE_LOCATION`.
* The fully parsed [location object](https://github.com/rackt/history/blob/master/docs/Location.md) is now stored in the state instead of a URL string. To access the path, use `state.routing.location.pathname` instead of `state.routing.path`.

[View the new docs](https://github.com/rackt/react-router-redux#api)

## [1.0.2](https://github.com/rackt/react-router-redux/compare/1.0.1...1.0.2)

* Only publish relevant files to npm

## [1.0.1](https://github.com/rackt/react-router-redux/compare/1.0.0...1.0.1)

* Solve problem with `basename` causing infinite redirects (#103)
* Switched to ES6 imports/exports internally, but should not affect outside users

## [1.0.0](https://github.com/rackt/react-router-redux/compare/0.0.10...1.0.0)
> 2015-12-09

This release changes quite a bit so you'll have to update your code.

**Breaking Changes:**

* The `updatePath` action creator has been removed in favor of `pushPath` and `replacePath`. Use `pushPath` to get the same behavior as before. (#38)
* We have added support for routing state (#38)
* Our actions are now [FSA compliant](https://github.com/acdlite/flux-standard-action). This means if you are listening for the `UPDATE_PATH` action in a reducer you should get properties off the `payload` property. (#63)

Other fixes:

* Redux DevTools should now work as expected (#73)
* As we no longer depend on `window.location`, `<base href="...">` should now work (#62)
* We've done lots of work on finding the right way to stop cycles, so hopefully we shouldn't have any unnecessary location or store updates (#50)
