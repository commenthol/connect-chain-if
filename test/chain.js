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

/**
 * generic error trap middleware
 * @param {Boolean} bubble : bubble error event
 */
const middlewareError = function (bubble) {
  return function (err, req, res, next) {
    if (!res.error) {
      res.error = []
    }
    res.error.push(err.message)
    if (bubble) {
      next && next(bubble) // jshint ignore:line
    } else {
      next && next() // jshint ignore:line
    }
  }
}

describe('chain', function () {
  it('should chain Array with one middleware', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      middleware({ res: { one: 1 } })
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1 })
      done()
    })
  })

  it('should chain Array of middlewares', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      middleware({ res: { one: 1 } }),
      middleware({ res: { two: 2 } })
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, two: 2 })
      done()
    })
  })

  it('should chain one middleware function', function (done) {
    const req = {}
    const res = { test: 1 }

    chain(
      middleware({ res: { one: 1 } })
    )(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1 })
      done()
    })
  })

  it('should chain two middleware functions', function (done) {
    const req = {}
    const res = { test: 1 }

    chain(
      middleware({ res: { one: 1 } }),
      middleware({ res: { two: 2 } })
    )(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, two: 2 })
      done()
    })
  })

  it('should chain "chain of chains"', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      middleware({ res: { one: 1 } }),
      middleware({ res: { two: 2 } }),
      chain([
        middleware({ res: { three: 3 } }),
        middleware({ res: { four: 4 } }),
        chain([
          middleware({ res: { five: 5 } }),
          middleware({ res: { six: 6 } })
        ])
      ])
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 })
      done()
    })
  })

  it('should chain empty chain', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1 })
      done()
    })
  })

  it('should chain building new chained middleware', function (done) {
    const req = {}
    const res = { test: 1 }

    // new middleware
    const newMw = function (req, res, next) {
      chain([
        middleware({ res: { one: 1 } }),
        middleware({ res: { two: 2 } })
      ])(req, res, function (err) {
        next(err)
      })
    }

    chain([newMw])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, two: 2 })
      done()
    })
  })

  it('should chain middleware throws exception and shall be caughth by error trap', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      middleware({ res: { one: 1 } }),
      function (req, res, next) {
        throw new Error('boom')
        next && next() // eslint-disable-line no-unreachable
      },
      middleware({ res: { two: 2 } }),
      middlewareError()
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, error: ['boom'] })
      done()
    })
  })
})

describe('chain with error trap', function () {
  it('should jump over error trap', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      middleware({ res: { one: 1 } }),
      middleware({ res: { two: 2 } }),
      middlewareError(),
      middleware({ res: { three: 3 } })
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, two: 2, three: 3 })
      done()
    })
  })

  it('should chain on error in middleware 1 jumping over middleware 2 and 3', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      middleware({ error: 'err1', res: { one: 1 } }),
      middleware({ res: { two: 2 } }),
      middleware({ res: { three: 3 } }),
      middlewareError(),
      middleware({ res: { four: 4 } })
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, error: ['err1'], four: 4 })
      done()
    })
  })

  it('should chsin with error in middleware 2', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      middleware({ res: { one: 1 } }),
      middleware({ error: 'err1', res: { two: 2 } }),
      middlewareError(),
      middleware({ res: { three: 3 } })
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, two: 2, error: ['err1'], three: 3 })
      done()
    })
  })

  it('should chain with  error in middleware 1 and 3', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      middleware({ error: 'err1', res: { one: 1 } }),
      middleware({ res: { two: 2 } }),
      middlewareError(),
      middleware({ error: 'err3', res: { three: 3 } }),
      middleware({ res: { four: 4 } }),
      middlewareError()
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, error: ['err1', 'err3'], three: 3 })
      done()
    })
  })

  it('should chain with error in middleware 2 and 4', function (done) {
    const req = {}
    const res = {}

    chain([
      middleware({ res: { one: 1 } }),
      middleware({ error: 'err2', res: { two: 2 } }),
      middlewareError(),
      middleware({ res: { three: 3 } }),
      middleware({ error: 'err4', res: { four: 4 } }),
      middlewareError()
    ])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { one: 1, two: 2, error: ['err2', 'err4'], three: 3, four: 4 })
      done()
    })
  })

  it('should chain building new chained middleware', function (done) {
    const req = {}
    const res = { test: 1 }

    // new middleware
    const newMw = function (req, res, next) {
      chain([
        middleware({ res: { one: 1 } }),
        middleware({ res: { two: 2 } })
      ])(req, res, function (err) {
        next(err)
      })
    }

    chain([newMw])(req, res, function (err) {
      assert.equal(err, null)
      assert.deepEqual(res, { test: 1, one: 1, two: 2 })
      done()
    })
  })

  it('should chain building new chained middleware, error bubbles up', function (done) {
    const req = {}
    const res = { test: 1 }

    // new middleware
    const newMw = function (req, res, next) {
      chain([
        middleware({ res: { one: 1 } }),
        middleware({ error: 'bubbling error', res: { two: 2 } })
      ])(req, res, function (err) {
        next(err)
      })
    }

    chain([newMw])(req, res, function (err) {
      assert.equal(err.message, 'bubbling error')
      assert.deepEqual(res, { test: 1, one: 1, two: 2 })
      done()
    })
  })

  it('should chain middleware causing exceptions', function (done) {
    const req = {}
    const res = { test: 1 }

    chain([
      function (req, res, next) {
        throw new Error('throwing errors is fun')
        next && next() // eslint-disable-line no-unreachable
      },
      function (err, req, res, next) {
        res.error = err.message
        next && next(new Error('another error')) // jshint ignore:line
      }
    ])(req, res, function (err) {
      assert.equal(err.message, 'another error')
      assert.deepEqual(res, { test: 1, error: 'throwing errors is fun' })
      done()
    })
  })
})
