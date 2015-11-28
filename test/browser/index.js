const { createHashHistory, createHistory } = require('history');
const createTests = require('../createTests.js');

createTests(createHashHistory, 'Hash History');
createTests(createHistory, 'Browser History');
