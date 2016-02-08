import { createMemoryHistory } from 'history'
import createTests from './_createSyncTest'

createTests(createMemoryHistory, 'Memory History')
