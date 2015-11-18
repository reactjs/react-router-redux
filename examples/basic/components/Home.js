const React = require('react');
const { connect } = require('react-redux');
const { increase, decrease } = require('../actions/count');

function Home({ number, increase, decrease }) {
  return (
    <div>
      Some state changes:
      {number}
      <button onClick={() => increase(1)}>Increase</button>
      <button onClick={() => decrease(1)}>Decrease</button>
    </div>
  );
};

module.exports = connect(
  state => ({ number: state.count.number }),
  { increase, decrease }
)(Home);
