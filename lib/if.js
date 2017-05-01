'use strict'

var chain = require('./chain')

/**
 * Conditionally select a middleware chain using if, else statement(s)
 *
 * @param {Boolean} if condition
 * @param {Array|Function} Array or Function of middlewares selected if `if` condition is met
 * @param {Array|Function} optional - last argument - Array or Function of middlewares selected as `else`
 * @return {Function} middleware function
 * @example
 * var a = 2;
 * chain.if( a===1, [ middlewares1 ], a===2, [ middlewares2 ], [ middlewaresElse ]);
 */
module.exports = function () {
  var i
  var args = Array.prototype.slice.call(arguments, 0)

  // if else is missing add it
  if (args.length % 2 === 0) {
    args.push(function (req, res, next) {
      next && next()
    })
  }

  for (i = 0; i < args.length - 1; i += 2) {
    if (args[i]) {
      return chain(args[i + 1])
    }
  }
  // else
  return chain(args[args.length - 1])
}
