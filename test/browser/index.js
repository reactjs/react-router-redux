import 'babel-polyfill'

import { createHashHistory, createHistory } from 'history'
import createTests from '../_createSyncTest'

createTests(createHashHistory, 'Hash History', () => window.location = '#/')
createTests(createHistory, 'Browser History', () => window.history.replaceState(null, null, '/'))
