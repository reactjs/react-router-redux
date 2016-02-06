import { createMemoryHistory } from 'react-router'
import createTests from './_createSyncTest'

createTests(createMemoryHistory(), 'Memory History')
