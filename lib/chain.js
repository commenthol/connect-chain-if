/*!
 * chain
 *
 * @copyright (c) 2014 commenthol
 * @license MIT
 */

/*jshint node:true*/

'use strict';

var options = {
  nextTick: true // set process.nextTick
};

/**
 * Decide wether to use process.nextTick to trigger event loop or use
 * direct "next" function call based on `options.nextTick`.
 * Behaviour can be controlled via:
 *
 *     chain.nextTick(true|false);
 *
 * @param {Function} next
 * @param {Error} err
 * @api private
 */
var nextTick = function(next, err) {
  if (options.nextTick) {
    return process.nextTick(function (){
      try {
        next(err);
      }
      catch(e) {
        next(e);
      }
    });
  }
  else {
    return next(err);
  }
};

/**
 * Chaining middlewares
 *
 * Array of functions using (req, res, next) as arguments; if first argument is a function then it is assumed that all arguments are middleware functions.
 *
 * of type `function (req, res, next)`
 *
 * @param {Array|Function} middlewares
 * @return {Function} middleware function
 * @api public
 */
var chain = function (middlewares) {

  if (middlewares === undefined) {
    return function(req, res, next) {
      next && next(); // jshint ignore:line
    };
  }
  // middlewares are passed as functions
  if (typeof middlewares === 'function') {
    middlewares = Array.prototype.slice.call(arguments, 0);
  }

  // the function required by the server
  return function (req, res, next) {
    var index = 0;

    // looping over all middleware functions defined by middlewares
    (function _next_(err){
      var
        arity,
        middleware = middlewares[index++]; // obtain the current middleware from the stack

      if (!middleware) {
        // we are at the end of the stack
        next && next(err); // jshint ignore:line
        return;
      }
      else {
        try {
          arity = middleware.length; // number of arguments function middleware requires
          // handle errors
          if (err) {
            // If the middleware function contains 4 arguments than this will act as an "error trap"
            if (arity === 4) {
              middleware(err, req, res, function (err) {
                nextTick(_next_, err);
              });
            }
            else {
              // otherwise check the next middleware
              _next_(err);
            }
          }
          else if (arity < 4) {
            // process non "error trap" middlewares
            middleware(req, res, function (err) {
              nextTick(_next_, err);
            });
          }
          else {
            // loop over "error traps" if no error `err` is set.
            _next_();
          }
        }
        catch(e) {
          _next_(e);
        }
      }
    })();

  };
};

/**
 * Change chain nextTick behaviour using process.nextTick globally
 *
 * @param {Boolean} nextTick
 * @api public
 */
chain.nextTick = function(nextTick) {
  options.nextTick = nextTick ? true : false;
};


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
