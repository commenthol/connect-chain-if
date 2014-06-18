var
  express = require('express'),
  chain = require('../../');

var
  app = express(),
  middleware1 = function(req, res, next) {
    res.body = req.url + '\n';
    next && next();
  },
  middleware2 = function(req, res, next) {
    res.writeHead(200);
    res.write(res.body || '');
    res.end();
  };

var newMiddleware = chain([ middleware1, middleware2 ]);
// or to maintain backward compatibility
newMiddleware = chain(middleware1, middleware2);

// then use it in express/ connect
app.use(newMiddleware);

app.listen(3000);
