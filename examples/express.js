const express = require('express')
const chain = require('..')

const app = express()
const middleware1 = function (req, res, next) {
  res.body = req.url + '\n'
  next && next()
}
const middleware2 = function (req, res, next) {
  res.writeHead(200)
  res.write(res.body || '')
  res.end()
}

let newMiddleware = chain([middleware1, middleware2])
// or to maintain backward compatibility
newMiddleware = chain(middleware1, middleware2)

// then use it in express/ connect
app.use(newMiddleware)

app.listen(3000)
