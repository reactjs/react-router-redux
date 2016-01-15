
## 2.0.3

This version is just 2.0.2 re-published with a more recent version of npm to fix an issue where the `history` module was being published with the tarball. See [#133](https://github.com/rackt/redux-simple-router/issues/133).

## [2.0.2](https://github.com/jlongster/redux-simple-router/compare/1.0.2...2.0.2)

Versions 2.0.0 and 2.0.1 were test releases for the 2.* series. 2.0.2 is the first public release.

**A whole new API, with many breaking changes:**

* `syncReduxAndRouter` is gone. Instead, call `syncHistory` with just the `history` object, which returns a middleware that you need to apply. (#141)
* If you use redux devtools, you need to call `middleware.listenForReplays(store)` on the middleware returned from `syncHistory`. Create the store first with the middleware, then call this function with the store.
* Action creators are now contained in a single object called `routeActions`. `go`, `goBack`, and `goForward` action creators have been added.
* `UPDATE_PATH` is now `UPDATE_LOCATION`.
* The fully parsed [location object](https://github.com/rackt/history/blob/master/docs/Location.md) is now stored in the state instead of a URL string. To access the path, use `state.routing.location.pathname` instead of `state.routing.path`.

## [1.0.2](https://github.com/jlongster/redux-simple-router/compare/1.0.1...1.0.2)

* Only publish relevant files to npm

## [1.0.1](https://github.com/jlongster/redux-simple-router/compare/1.0.0...1.0.1)

* Solve problem with `basename` causing infinite redirects (#103)
* Switched to ES6 imports/exports internally, but should not affect outside users

## [1.0.0](https://github.com/jlongster/redux-simple-router/compare/0.0.10...1.0.0)
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
