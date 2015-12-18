
## HEAD

## [1.0.0](https://github.com/jlongster/redux-simple-router/compare/1.0.0...1.0.1)

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
