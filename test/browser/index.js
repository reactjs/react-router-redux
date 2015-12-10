const { createHashHistory, createHistory } = require('history');
const createTests = require('../createTests.js');

createTests(createHashHistory, 'Hash History', () => window.location = '#/');
createTests(createHistory, 'Browser History', () => window.history.pushState(null, null, '/'));
