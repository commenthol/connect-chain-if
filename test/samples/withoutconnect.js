var
  http = require('http'),
  chain = require('../../');

var
  middleware1 = function(req, res, next) {
    if (/^\/[a-z]?$/.test(req.url)) {
      res.body = req.url;
      next && next();
    }
    else {
      next && next(new Error('err'));
    }
  },
  middleware2 = function(req, res, next) {
    res.writeHead(200);
    res.write(res.body || '');
    res.end();
  },
  middlewareErr = function(err, req, res, next) {
    res.writeHead(404);
    res.end();
  };

http.createServer(chain([ middleware1, middleware2, middlewareErr ]))
  .listen(3000, 'localhost');
