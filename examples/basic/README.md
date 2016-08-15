react-router-redux basic example
=================================

This is a basic example that demonstrates rendering components based
on URLs with `react-router` as well as connecting them to Redux state.
It uses both `<Link>` elements as well as the `push` action creator
provided by react-router-redux.

This example also demonstrates integration with
**[redux-devtools](https://github.com/gaearon/redux-devtools) ^3.0.0**

**To run, follow these steps:**

1. Install dependencies with `npm install` in this directory (make sure it creates a local node_modules)
2. By default, it uses the local version from `src` of react-router-redux, so you need to run `npm install` from there first. If you want to use a version straight from npm, remove the lines in `webpack.config.js` at the bottom.
3. Start build with `npm start`
4. Open [http://localhost:8080/](http://localhost:8080/)

-

If you want to run the example from the npm published version of
**react-router-redux**, remove the alias in `webpack.config`
to the source from line 21.

This example uses the latest version, switch to a specific tag to use a stable version:

e.g. [react-router-redux tag 1.0.2](https://github.com/reactjs/react-router-redux/tree/1.0.2/examples/basic)
