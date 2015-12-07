const { createHashHistory, createBrowserHistory } = require('history');
const createTests = require('../createTests.js');

createTests(createHashHistory, 'Hash History', () => window.location = '#/');
createTests(createBrowserHistory, 'Browser History', () => window.history.pushState(null, null, '/'));
