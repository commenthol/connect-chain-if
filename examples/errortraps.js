const chain = require('..')

const middleware1 = function (req, res, next) {
  // ... something bad happened
  console.log('middleware1')
  next && next(new Error('error'))
}
const middleware2 = function (req, res, next) {
  console.log('middleware2')
  next && next()
}
const middleware3 = function (req, res, next) {
  console.log('middleware3')
  next && next()
}
const middlewareErr = function (err, req, res, next) { // note the "4" arguments
  console.log('trapped error:', err.message)
  next && next()
}

chain([
  middleware1,
  middleware2,
  middlewareErr,
  middleware3
])({}, {})
