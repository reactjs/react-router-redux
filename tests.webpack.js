const browserContext = require.context('./test/browser', true, /\.js$/);
browserContext.keys().forEach(browserContext);
