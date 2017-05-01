var chain = require('..')

var middleware = function (req, res, next) {
  chain([
    chain.if(
      /* if */ /^\/$/.test(req.url), [ // defines a new middleware chain here
        function (req, res, next) {
          res.body = 'homepage'
          next && next()
        },
        function (req, res, next) {
          res.statusCode = 200
          next && next()
        }],
      /* if */ /^\/error500$/.test(req.url), function (req, res, next) {
        res.body = 'weired'
        res.statusCode = 500
        next && next()
      },
      /* else */ function (req, res, next) {
        res.body = 'no idea'
        res.statusCode = 404
        next && next()
      }
    ),
    function (req, res, next) {
      console.log(res.statusCode, res.body)
      next && next()
    }
  ])(req, res, function (err) {
    next && next(err)
  })
}

middleware({url: '/'}, {})
// > 200 'homepage'
middleware({url: '/error500'}, {})
// > 500 'weired'
middleware({url: '/something'}, {})
// > 404 'no idea'
