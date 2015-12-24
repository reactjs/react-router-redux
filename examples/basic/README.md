This is a basic example that demonstrates rendering components based
on URLs with react-router as well as connecting them to Redux state.
It uses both <Link> elements and the `updatePath` action creator to
update the paths.

To run, follow these steps:

1. Install dependencies with `npm install` in this directory (make sure it creates a local node_modules)
2. By default, it uses the local version from `src` of redux-simple-router, so you need to run `npm install` from there first. If you want to use a version straight from npm, remove the lines in `webpack.config.js` at the bottom.
3. Build with `webpack --watch`
4. Open `index.html`

If you want to run the example from the npm published version of **redux-simple-router** remove the alias in the webpack.config to the source from line 21.

The current example uses the latest version, switch to a specific tag to use a stable version:

e.g. [redux-simple-router tag 1.0.2](https://github.com/rackt/redux-simple-router/tree/1.0.2/examples/basic)
