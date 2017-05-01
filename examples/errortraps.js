var chain = require('..')

var middleware1 = function (req, res, next) {
  // ... something bad happened
  console.log('middleware1')
  next && next(new Error('error'))
}
var middleware2 = function (req, res, next) {
  console.log('middleware2')
  next && next()
}
var middleware3 = function (req, res, next) {
  console.log('middleware3')
  next && next()
}
var middlewareErr = function (err, req, res, next) { // note the "4" arguments
  console.log('trapped error:', err.message)
  next && next()
}

chain([
  middleware1,
  middleware2,
  middlewareErr,
  middleware3
])({}, {})
