import 'babel-polyfill'

import { hashHistory, browserHistory } from 'react-router'
import createTests from '../_createSyncTest'

createTests(hashHistory, 'Hash History', () => window.location = '#/')
createTests(browserHistory, 'Browser History', () => window.history.replaceState(null, null, '/'))
