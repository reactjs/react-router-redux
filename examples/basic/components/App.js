const React = require('react');
const { Link } = require('react-router');
const { connect } = require('react-redux');
const { updatePath } = require('redux-simple-router');
const { increase, decrease } = require('../actions/count');

const App = React.createClass({
  render: function() {
    return (
      <div>
        <header>
          Links:
          {' '}
          <Link to="/foo">Foo</Link>
          {' '}
          <Link to="/bar">Bar</Link>
        </header>
        {this.props.children}
        <div>
          {this.props.number}
          <button onClick={() => this.props.increase(1)}>Increase</button>
          <button onClick={() => this.props.decrease(1)}>Decrease</button>
          <button onClick={() => this.props.updatePath('/foo')}>Decrease</button>
        </div>
      </div>
    );
  }
});

module.exports = connect(
  state => ({ number: state.count.number }),
  { increase, decrease, updatePath }
)(App);
