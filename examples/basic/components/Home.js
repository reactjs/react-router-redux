import React from 'react'
import { connect } from 'react-redux'
import { increase, decrease } from '../actions/count'

function Home({ number, increase, decrease }) {
  return (
    <div>
      Some state changes:
      {number}
      <button onClick={() => increase(1)}>Increase</button>
      <button onClick={() => decrease(1)}>Decrease</button>
    </div>
  )
}

export default connect(
  state => ({ number: state.count.number }),
  { increase, decrease }
)(Home)
