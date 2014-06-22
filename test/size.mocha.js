/*!
 * test suites for large middleware sizes
 * 
 * @license MIT
 */

/*jshint node:true*/
/*globals describe, it*/

"use strict";

var
  assert = require('assert'),
  chain = require('../');

// random value
function random () {
  return ( Math.random() * 99 + 1 ) |0;
}

function newMiddleware(){
  return function(req, res, next){
    res.number += random();
    res.count += 1;
    return next();
  };
}

describe ("run 2500 middlewares", function(){
  it ("- synchronously", function(done){
    var 
      i,
      size = 2500, // c.a. size = 2850 is the maximum number of middlewares
      middlewares = [],
      req = {},
      res = { number: 0, count: 0 };

    // compose middlewares
    for (i = 0; i < size; i++) {
      middlewares.push(newMiddleware());
    }

    chain.nextTick(false);
    chain(middlewares)(req, res , function(err) {
      assert.equal(middlewares.length, size);
      assert.equal(res.count, size);
      done();
    });
  });
});

describe ("run 1 mio middlewares", function(){
  this.timeout(10000);
  
  it ("- with nextTick", function(done){
    var 
      i,
      size = 1000000,
      middlewares = [],
      req = {},
      res = { number: 0, count: 0 };

    // compose middlewares
    for (i = 0; i < size; i++) {
      middlewares.push(newMiddleware());
    }

    chain.nextTick(true); 
    chain(middlewares)(req, res , function(err) {
      assert.equal(middlewares.length, size);
      assert.equal(res.count, size);
      assert.ok(res.number > size);
      assert.ok(res.number < size * 100);
      done();
    });
  });
});

