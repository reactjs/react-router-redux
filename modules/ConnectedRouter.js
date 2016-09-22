import React, { PropTypes } from 'react'
import BrowserHistory from 'react-history/BrowserHistory'
import { StaticRouter } from 'react-router/StaticRouter'

const ConnectedRouter = ({ history:History, basename, keyLength, ...rest }) => (
  <History basename={basename} keyLength={keyLength}>
    {({ history, action, location }) => (
        <StaticRouter
          action={action}
          location={location}
          basename={basename}
          onPush={history.push}
          onReplace={history.replace}
          blockTransitions={history.block}
          {...rest}
        />
      )}
  </History>
)

ConnectedRouter.propTypes = {
  history: PropTypes.func,
  basename: PropTypes.string,
  keyLength: PropTypes.number
}

ConnectedRouter.defaultProps = {
  history: BrowserHistory
}

export default ConnectedRouter
