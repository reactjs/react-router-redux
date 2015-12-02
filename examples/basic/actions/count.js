const constants = require('../constants');

function increase(n) {
  return {
    type: constants.INCREASE,
    amount: n
  };
}

function decrease(n) {
  return {
    type: constants.DECREASE,
    amount: n
  };
}

module.exports = { increase, decrease };
