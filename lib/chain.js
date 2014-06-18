/*!
 * chain
 *
 * @copyright (c) 2014 commenthol
 * @license MIT
 */

/*jshint node:true*/

'use strict';

var 
  chain = require('connect-chain');

/**
 * Conditionally select a middleware chain using if, else statement(s)
 *
 * Example:
 *
 *     var a = 2;
 *     chain.if( a===1, [ middlewares1 ], a===2, [ middlewares2 ], [ middlewaresElse ]);
 *
 * @param {Boolean} if condition
 * @param {Array|Function} Array or Function of middlewares selected if `if` condition is met
 * @param {Array|Function} optional - last argument - Array or Function of middlewares selected as `else`
 * @return {Function} middleware function
 * @api public
 */
chain.if = function () {
  var
    i,
    args = Array.prototype.slice.call(arguments, 0);

  // if else is missing add it
  if (args.length % 2 === 0) {
    args.push(function (req, res, next){
      next && next(); // jshint ignore:line
    });
  }

  for (i = 0; i < args.length -1; i += 2) {
    if (args[i]) {
      return chain(args[i+1]);
    }
  }
  // else
  return chain(args[args.length-1]);
};

/**
 * conditionally select a middleware chain using switch, case statement(s)
 *
 * Example:
 *
 *     var a = 2;
 *     chain.switch(a, 1, [ middlewares1 ], 2, [ middlewares2 ], [ middlewaresDefault ]);
 *
 * @param {Boolean|Number|String} expr : switch expression
 * @param {Boolean|Number|String} case exprN : case expression
 * @param {Array|Function} middlewaresN : Array or Function of middlewares selected if `case` expression is met
 * @param {Array|Function} middlewaresDefault : optional - last argument - Array or Function of middlewares selected as `default`
 * @return {Function} middleware function
 * @api public
 */
chain.switch = function () {
  var
    i,
    args = Array.prototype.slice.call(arguments, 0),
    compare = args[0];

  // if default is missing add it
  if (args.length % 2 === 1) {
    args.push(function (req, res, next){
      next && next(); // jshint ignore:line
    });
  }

  for (i = 1; i < args.length -1; i += 2) {
    if (compare === args[i]) {
      return chain(args[i+1]);
    }
  }
  // default
  return chain(args[args.length-1]);
};

module.exports = chain;
