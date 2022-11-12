/*!
 * chain
 *
 * @copyright (c) 2014- commenthol
 * @license MIT
 */

'use strict'

const options = {
  fn: process.nextTick,
  nextTick: true // set process.nextTick
}

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
const nextTick = function (next, err) {
  if (options.nextTick) {
    return options.fn(function () {
      try {
        next(err)
      } catch (e) {
        next(e)
      }
    })
  } else {
    return next(err)
  }
}

/**
 * Chaining middlewares
 *
 * Array of functions using (req, res, next) as arguments; if first argument is a function then it is assumed that all arguments are middleware functions.
 *
 * of type `function (req, res, next)`
 *
 * @param {...Function|Array} middlewares
 * @return {Function} middleware function
 * @api public
 */
const chain = function (middlewares) {
  if (middlewares === undefined) {
    return function (req, res, next) {
      next && next()
    }
  }
  // middlewares are passed as functions
  if (typeof middlewares === 'function') {
    middlewares = [].slice.call(arguments)
  }

  // the function required by the server
  return function (req, res, next) {
    let index = 0

    // looping over all middleware functions defined by middlewares
    ;(function _next_ (err) {
      let middleware = middlewares[index++] // obtain the current middleware from the stack
      try {
        // handle errors
        if (err) {
          // If the middleware function contains 4 arguments than this will act as an "error trap"
          // search for next function of arity 4
          while (middleware && middleware.length !== 4) {
            middleware = middlewares[index++]
          }
          // process "error trap" middleware
          middleware && middleware(err, req, res, function (err) {
            nextTick(_next_, err)
          })
        } else {
          // search for next function of arity < 4
          while (middleware && middleware.length > 3) {
            middleware = middlewares[index++]
          }
          // process non "error trap" middleware
          middleware && middleware(req, res, function (err) {
            nextTick(_next_, err)
          })
        }
      } catch (e) {
        _next_(e)
      }

      if (!middleware) {
        // we are at the end of the stack
        next && next(err)
      }
    })()
  }
}

/**
 * Change chain nextTick behaviour using process.nextTick globally
 *
 * @param {Boolean} nextTick
 * @api public
 */
chain.nextTick = function (nextTick) {
  options.nextTick = !!nextTick
}

module.exports = chain
