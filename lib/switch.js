'use strict'

const chain = require('./chain')

/**
 * conditionally select a middleware chain using switch, case statement(s)
 *
 * @example:
 * var a = 2;
 * chain.switch(a, 1, [ middlewares1 ], 2, [ middlewares2 ], [ middlewaresDefault ]);
 *
 * @param {Boolean|Number|String} expr : switch expression
 * @param {Boolean|Number|String} case exprN : case expression
 * @param {Array|Function} middlewaresN : Array or Function of middlewares selected if `case` expression is met
 * @param {Array|Function} middlewaresDefault : optional - last argument - Array or Function of middlewares selected as `default`
 * @return {Function} middleware function
 * @api public
 */
module.exports = function chainSwitch (...args) {
  const compare = args[0]

  // if default is missing add it
  if (args.length % 2 === 1) {
    args.push(function (req, res, next) {
      next && next() // jshint ignore:line
    })
  }

  for (let i = 1; i < args.length - 1; i += 2) {
    if (compare === args[i]) {
      return chain(args[i + 1])
    }
  }
  // default
  return chain(args[args.length - 1])
}
