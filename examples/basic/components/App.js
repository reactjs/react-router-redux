import React from 'react';
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { routeActions } from 'redux-simple-router';

function App({ push, children }) {
  return (
    <div>
      <header>
        Links:
        {' '}
        <Link to="/">Home</Link>
        {' '}
        <Link to="/foo">Foo</Link>
        {' '}
        <Link to="/bar">Bar</Link>
      </header>
      <div>
        <button onClick={() => push('/foo')}>Go to /foo</button>
      </div>
      <div style={{marginTop: '1.5em'}}>{children}</div>
    </div>
  );
};

module.exports = connect(
  null,
  routeActions
)(App);
