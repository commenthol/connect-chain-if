/*!
 * mocha test suite for chain
 *
 * @license MIT
 */

/* eslint handle-callback-err:0 */
/* global describe, it */

'use strict'

var assert = require('assert')
var chain = require('..')

/**
 * generic middleware for our tests
 * @param {Object} options
 * @property {Object} options.name : push `options.name` to `res.name`
 * @property {Object} options.res : add `options.res` to `res`
 */
var middleware = function (options) {
  options = options || {}

  return function (req, res, next) {
    var i

    if (options.name) {
      if (!res.name) {
        res.name = []
      }
      res.name.push(options.name)
    }
    if (options.res) {
      for (i in options.res) {
        res[i] = options.res[i]
      }
    }
    if (options.error) {
      next && next(new Error(options.error)) // jshint ignore:line
    } else {
      next && next() // jshint ignore:line
    }
  }
}

describe('chain.switch', function () {
  it('- evaluate to default with one case expr', function (done) {
    var req = {}
    var res = {}
    var a = 0

    chain.switch(a,
      1, middleware({ name: 'case1' }),
      middleware({ name: 'default' })
    )(req, res, function (err) {
      assert.deepEqual(res, { name: ['default'] })
      done()
    })
  })

  it('- evaluate to a===1', function (done) {
    var req = {}
    var res = {}
    var a = 1

    chain.switch(a,
        1, middleware({ name: 'case1' }),
        2, middleware({ name: 'case2' }),
        middleware({ name: 'default' })
    )(req, res, function (err) {
      assert.deepEqual(res, { name: ['case1'] })
      done()
    })
  })

  it('- evaluate to a===2', function (done) {
    var req = {}
    var res = {}
    var a = 2

    chain.switch(a,
      1, middleware({ name: 'case1' }),
      2, middleware({ name: 'case2' }),
      middleware({ name: 'default' })
    )(req, res, function (err) {
      assert.deepEqual(res, { name: ['case2'] })
      done()
    })
  })

  it('- evaluate to default', function (done) {
    var req = {}
    var res = {}
    var a = 0

    chain.switch(a,
      1, middleware({ name: 'case1' }),
      2, middleware({ name: 'case2' }),
      middleware({ name: 'default' })
    )(req, res, function (err) {
      assert.deepEqual(res, { name: ['default'] })
      done()
    })
  })

  it('- evaluate to else not being explicitely set', function (done) {
    var req = {}
    var res = {}
    var a = 0

    chain.switch(a,
      1, middleware({ name: 'case1' }),
      2, middleware({ name: 'case2' })
    )(req, res, function (err) {
      assert.deepEqual(res, {})
      done()
    })
  })

  it('- nesting switch statements', function (done) {
    var req = {}
    var res = {}
    var a = 0
    var b = 1

    chain.switch(
      a,
      1, middleware({ name: 'casea1' }),
      chain.switch(
        b,
        0, middleware({ name: 'caseb0' }),
        1, middleware({ name: 'caseb1' })
      )
    )(req, res, function (err) {
      assert.deepEqual(res, { name: ['caseb1'] })
      done()
    })
  })

  it('- combining conditional switch middlewares', function (done) {
    var req = {}
    var res = {}
    var a = 0
    var b = 1

    chain([
      middleware({ name: 'one' }),
      chain.switch(
        a,
        0, middleware({ name: 'casea0' }),
        1, middleware({ name: 'casea1' }),
        2, middleware({ name: 'casea2' })
      ),
      chain.switch(
        b,
        0, middleware({ name: 'caseb0' }),
        1, middleware({ name: 'caseb1' })
      ),
      middleware({ name: 'two' })
    ])(req, res, function (err) {
      assert.deepEqual(res, { name: ['one', 'casea0', 'caseb1', 'two'] })
      done()
    })
  })
})
