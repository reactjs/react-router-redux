import React from 'react'
import { renderToString } from 'react-dom/server'

import ConnectedRouter from '../ConnectedRouter'

describe('ConnectedRouter', () => {
  it('creates a connected router', () =>{
    const html = renderToString(
      <ConnectedRouter>
        <div>Hi!</div>
      </ConnectedRouter>
    )

    expect(html).toContain('Hi!')
  })
})
