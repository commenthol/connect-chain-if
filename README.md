# Connect-Chain-If

"connect-chain-if" is a middleware that composes a new middleware of type `function(req, res, next)` from a chain of middlewares to be called in series.
The new middleware is fully [connect][connect] compliant.

An error passed to `next` or thrown in a middleware will short circuit the chain and be
passed to the next error middleware of type `function(err, req, res, next)` in the connect middleware chain.

You can use "connect-chain-if" to build up new middlewares from existing connect-style-middlewares using the conditional expressions `chain.if()` and `chain.switch()`.

To allow breaking up long lasting middleware chains, all middlewares within a chain are processed via the node event loop using `process.nextTick` instead of being processed synchroniously. Use `chain.nextTick(false);` to revert to the synchronous behaviour.

## Usage

### Building new middlewares

```javascript
var
  express = require('express'),
  chain = require('connect-chain-if');

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
    next && next();
  };

var newMiddleware = chain([ middleware1, middleware2 ]);
// or to maintain backward compatibility
newMiddleware = chain(middleware1, middleware2);

// then use it in express/ connect
app.use(newMiddleware);

app.listen(3000);
```

### Building middlewares with error traps

```javascript
var
  chain = require('connect-chain-if');

var
  middleware1 = function(req, res, next) {
    // ... something bad happened
    console.log('middleware1');
    next && next(new Error('error'));
  },
  middleware2 = function(req, res, next) {
    console.log('middleware2');
    next && next();
  },
  middleware3 = function(req, res, next) {
    console.log('middleware3');
    next && next();
  },
  middlewareErr = function(err, req, res, next) { // note the "4" arguments
    console.log('trapped error:', err.message);
    next && next();
  };
    next && next();
  };

chain([
  middleware1,
  middleware2,
  middlewareErr,
  middleware3
])({},{});
```

In this example `middleware2` will be bypassed. Output is:

```
middleware1
trapped error: error
middleware3
```

### Using connect middlewares without connect/ express

```javascript
var
  http = require('http'),
  chain = require('connect-chain-if');

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
```

*NOTE:* Take care that in this case your very last middleware in the `chain` handles any error.

```bash
curl -v localhost:3000/a
#> < HTTP/1.1 200 OK
#> /a
curl -v localhost:3000/aaa
#> < HTTP/1.1 404 Not Found
```

### Creating conditional middlewares

You can either use `chain.if` or `chain.switch` to define conditional middlewares.

```javascript
var
  chain = require('connect-chain-if');

var middleware = function(req, res, next) {
  chain([
    chain.if(
      /*if */ /^\/$/.test(req.url), [ // defines a new middleware chain here
        function(req, res, next) {
          res.body = 'homepage';
          next && next();
        },
        function(req, res, next) {
          res.statusCode = 200;
          next && next();
      }],
      /*if */ /^\/error500$/.test(req.url), function(req, res, next) {
        res.body = 'weired';
        res.statusCode = 500;
        next && next();
      },
      /*else */ function(req, res, next) {
        res.body = 'no idea';
        res.statusCode = 404;
        next && next();
      }
    ),
    function (req, res, next) {
      console.log(res.statusCode, res.body);
      next && next();
    }
  ])(req, res, function (err) {
    next && next(err);
  });
};

middleware({ url: '/' }, {});
//> 200 'homepage'
middleware({ url: '/error500'}, {});
//> 500 'weired'
middleware({ url: '/something'}, {});
//> 404 'no idea'
```

Using `chain.switch`:

```javascript
var
  chain = require('connect-chain-if');

var middleware = function(req, res, next) {
  chain([
    chain.switch(
      /*switch */ req.url,
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
  ])(req, res, function (err) {
    next && next(err);
  });
};

middleware({ url: '/' }, {});
//> 200 'homepage'
middleware({ url: '/error500'}, {});
//> 500 'weired'
middleware({ url: '/something'}, {});
//> 404 'no idea'
```

## License

Software is released under [MIT][license].

[connect]: https://github.com/senchalabs/connect
[license]: ./LICENSE
