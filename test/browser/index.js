import { createHashHistory, createHistory } from 'history'
import createTests from '../createTests.js'

createTests(createHashHistory, 'Hash History', () => window.location = '#/')
createTests(createHistory, 'Browser History', () => window.history.replaceState(null, null, '/'))
