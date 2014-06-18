var
  chain = require('../../');

var middleware = chain([
  chain.switch(
    /*switch */ function(req, res) {
      return req.url;
    },
    /*case */ '/', [ // defines a new middleware chain here
      function(req, res, next) {
        res.body = 'homepage';
        next && next();
      },
      function(req, res, next) {
        res.statusCode = 200;
        next && next();
    }],
    /*case */ '/error500', function(req, res, next) {
      res.body = 'weired';
      res.statusCode = 500;
      next && next();
    },
    /*default */ function(req, res, next) {
      res.body = 'no idea';
      res.statusCode = 404;
      next && next();
    }
  ),
  function (req, res, next) {
    console.log(res.statusCode, res.body);
    next && next();
  }
]);
  
middleware({ url: '/' }, {});
//> 200 'homepage'
middleware({ url: '/error500'}, {});
//> 500 'weired'
middleware({ url: '/something'}, {});
//> 404 'no idea'
