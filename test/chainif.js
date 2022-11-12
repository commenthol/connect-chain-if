/*!
 * mocha test suite for chain
 *
 * @license MIT
 */

/* eslint handle-callback-err:0 */
/* global describe, it */

'use strict'

const assert = require('assert')
const chain = require('..')

/**
 * generic middleware for our tests
 * @param {Object} options
 * @property {Object} options.name : push `options.name` to `res.name`
 * @property {Object} options.res : add `options.res` to `res`
 */
const middleware = function (options) {
  options = options || {}

  return function (req, res, next) {
    let i

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

describe('chain.if', function () {
  it('should evaluate to else with one if', function (done) {
    const req = {}
    const res = {}
    const a = 0

    chain.if(
      a === 1, middleware({ name: 'if1' }),
      middleware({ name: 'else' })
    )(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { name: ['else'] })
      done()
    })
  })

  it('should evaluate to a===1', function (done) {
    const req = {}
    const res = {}
    const a = 1

    chain.if(
      a === 1, middleware({ name: 'if1' }),
      a === 2, middleware({ name: 'if2' }),
      middleware({ name: 'else' })
    )(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { name: ['if1'] })
      done()
    })
  })

  it('should evaluate to a===2', function (done) {
    const req = {}
    const res = {}
    const a = 2

    chain.if(
      a === 1, middleware({ name: 'if1' }),
      a === 2, middleware({ name: 'if2' }),
      middleware({ name: 'else' })
    )(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { name: ['if2'] })
      done()
    })
  })

  it('should evaluate to else', function (done) {
    const req = {}
    const res = {}
    const a = 0

    chain.if(
      a === 1, middleware({ name: 'if1' }),
      a === 2, middleware({ name: 'if2' }),
      middleware({ name: 'else' })
    )(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { name: ['else'] })
      done()
    })
  })

  it('should evaluate to else not being explicitely set', function (done) {
    const req = {}
    const res = {}
    const a = 0

    chain.if(
      a === 1, middleware({ name: 'if1' }),
      a === 2, middleware({ name: 'if2' })
    )(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, {})
      done()
    })
  })

  it('should nest if statements', function (done) {
    const req = {}
    const res = {}
    const a = 0
    const b = 1

    chain.if(
      a === 1, middleware({ name: 'ifa1' }),
      chain.if(
        b === 1, middleware({ name: 'ifb1' })
      )
    )(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { name: ['ifb1'] })
      done()
    })
  })

  it('should combine conditional if middlewares', function (done) {
    const req = {}
    const res = {}
    const a = 0
    const b = 1

    chain([
      middleware({ name: 'one' }),
      chain.if(
        a === 1, middleware({ name: 'ifa1' })
      ),
      chain.if(
        b === 1, middleware({ name: 'ifb1' })
      ),
      middleware({ name: 'two' })
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { name: ['one', 'ifb1', 'two'] })
      done()
    })
  })
})
