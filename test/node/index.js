const { createMemoryHistory } = require('history');
const createTests = require('../createTests.js');

createTests(createMemoryHistory, 'Memory History');
