/*!
 * test suites for large middleware sizes
 *
 * @license MIT
 */

/* eslint handle-callback-err:0 */
/* global describe, it */

'use strict'

const assert = require('assert')
const chain = require('..')

// random value
function random () {
  return (Math.random() * 99 + 1) | 0
}

function newMiddleware () {
  return function (req, res, next) {
    res.number += random()
    res.count += 1
    return next()
  }
}

describe('run 2000 middlewares', function () {
  it('- synchronously', function (done) {
    let i
    const size = 2000 // c.a. size = 2850 is the maximum number of middlewares
    const middlewares = []
    const req = {}
    const res = { number: 0, count: 0 }

    // compose middlewares
    for (i = 0; i < size; i++) {
      middlewares.push(newMiddleware())
    }

    chain.nextTick(false)
    chain(middlewares)(req, res, function (err) {
      assert.equal(err, null)
      assert.equal(middlewares.length, size)
      assert.equal(res.count, size)
      done()
    })
  })
})

describe('run 1 mio middlewares', function () {
  this.timeout(10000)

  it('- with nextTick', function (done) {
    let i
    const size = 1000000
    const middlewares = []
    const req = {}
    const res = { number: 0, count: 0 }

    // compose middlewares
    for (i = 0; i < size; i++) {
      middlewares.push(newMiddleware())
    }

    chain.nextTick(true)
    chain(middlewares)(req, res, function (err) {
      assert.equal(err, null)
      assert.equal(middlewares.length, size)
      assert.equal(res.count, size)
      assert.ok(res.number > size)
      assert.ok(res.number < size * 100)
      done()
    })
  })
})
