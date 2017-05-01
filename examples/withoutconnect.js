var http = require('http')
var chain = require('..')

var middleware1 = function (req, res, next) {
  if (/^\/[a-z]?$/.test(req.url)) {
    res.body = req.url
    next && next()
  } else {
    next && next(new Error('err'))
  }
}
var middleware2 = function (req, res, next) {
  res.writeHead(200)
  res.write(res.body || '')
  res.end()
}
var middlewareErr = function (err, req, res, next) { // eslint-disable-line handle-callback-err
  res.writeHead(404)
  res.end()
}

http.createServer(chain([ middleware1, middleware2, middlewareErr ]))
  .listen(3000, 'localhost')
