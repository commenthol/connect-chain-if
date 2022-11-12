const http = require('http')
const chain = require('..')

const middleware1 = function (req, res, next) {
  if (/^\/[a-z]?$/.test(req.url)) {
    res.body = req.url
    next && next()
  } else {
    next && next(new Error('err'))
  }
}
const middleware2 = function (req, res, next) {
  res.writeHead(200)
  res.write(res.body || '')
  res.end()
}
const middlewareErr = function (err, req, res, next) { // eslint-disable-line handle-callback-err
  console.error(err)
  res.writeHead(404)
  res.end()
}

http.createServer(chain([middleware1, middleware2, middlewareErr]))
  .listen(3000, 'localhost')
