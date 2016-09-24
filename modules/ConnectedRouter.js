import React, { Component, PropTypes } from 'react'
import BrowserHistory from 'react-history/BrowserHistory'
import StaticRouter from 'react-router/StaticRouter'

import { LOCATION_CHANGE } from './reducer'

class ConnectedRouter extends Component {
  static propTypes = {
    store: PropTypes.object,
    history: PropTypes.func,
    basename: PropTypes.string,
    keyLength: PropTypes.number
  }

  static contextTypes = {
    store: PropTypes.object
  }

  static defaultProps = {
    history: BrowserHistory
  }

  render() {
    const { history:History, basename, keyLength, ...props } = this.props

    return (
      <History location={location} basename={basename} keyLength={keyLength}>
        {({ history, action, location }) => {
          const store = this.context.store || this.props.store

          store.dispatch({
            type: LOCATION_CHANGE,
            payload: { action, location }
          })

          return (
            <StaticRouter
              action={action}
              location={location}
              basename={basename}
              onPush={history.push}
              onReplace={history.replace}
              blockTransitions={history.block}
              {...props}
            />)
          }}
      </History>
    )
  }
}

export default ConnectedRouter
