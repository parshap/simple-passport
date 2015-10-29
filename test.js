"use strict";

// Lots of tests taken from PassportJS tests
// https://github.com/jaredhanson/passport/tree/master/test

var test = require("tape");
var passport = require("./");

test("authenticate() success", function(t) {
  var called = 0;
  var user = { id: '1', username: 'jaredhanson' };
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    called +=1 ;
    this.success(user);
  };

  var mockReq = {};
  var mockRes = {};
  var options = {};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val) {
    t.ifError(err);
    t.equal(called, 1);
    t.ok(val);
    t.equal(val.id, "1");
    t.equal(val.username, "jaredhanson");
    t.equal(val, user);
    t.end();
  });
});

test("authenticate() success with info", function(t) {
  var user = { id: '1', username: 'jaredhanson' };
  var infoObject = { reason: "password" };
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.success(user, infoObject);
  };

  var mockReq = {};
  var mockRes = {};
  var options = {};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val, info) {
    t.ifError(err);
    t.ok(val);
    t.equal(val, user);
    t.equal(info, infoObject);
    t.end();
  });
});

test("authenticate() success with options", function(t) {
  function Strategy() {
  }
  Strategy.prototype.authenticate = function(req, options) {
    this.success(options);
  };

  var mockReq = {};
  var mockRes = {};
  var options = { foo: "bar"};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val) {
    t.ifError(err);
    t.ok(val);
    t.equal(val.foo, "bar");
    t.equal(val, options);
    t.end();
  });
});

test("authenticate() error", function(t) {
  var errObject = new Error('something is wrong');
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.error(errObject);
  };

  var mockReq = {};
  var mockRes = {};
  var options = {};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val) {
    t.ok(err);
    t.ok(err instanceof Error);
    t.equal(err, errObject);
    t.equal(err.message, "something is wrong");
    t.equal(val, undefined);
    t.end();
  });
});

test("authenticate() fail", function(t) {
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.fail();
  };

  var mockReq = {};
  var mockRes = {};
  var options = {};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val) {
    t.ifError(err);
    t.equal(val, false);
    t.end();
  });
});

test("authenticate() fail with info", function(t) {
  var infoObject = { reason: "password" };
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.fail(infoObject);
  };

  var mockReq = {};
  var mockRes = {};
  var options = {};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val, info, status) {
    t.ifError(err);
    t.equal(val, false);
    t.equal(info, infoObject);
    t.equal(status, undefined);
    t.end();
  });
});

test("authenticate() fail with status", function(t) {
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.fail(403);
  };

  var mockReq = {};
  var mockRes = {};
  var options = {};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val, info, status) {
    t.ifError(err);
    t.equal(val, false);
    t.equal(info, undefined);
    t.equal(status, 403);
    t.end();
  });
});

test("authenticate() fail with info and status", function(t) {
  var infoObject = { reason: "password" };
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.fail(infoObject, 403);
  };

  var mockReq = {};
  var mockRes = {};
  var options = {};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val, info, status) {
    t.ifError(err);
    t.equal(val, false);
    t.equal(info, infoObject);
    t.equal(status, 403);
    t.end();
  });
});

test("authenticate() pass", function(t) {
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.pass();
  };

  var mockReq = {};
  var mockRes = {};
  var options = {};
  var strategy = new Strategy();
  passport.authenticate(mockReq, mockRes, strategy, options, function(err, val) {
    t.ifError(err);
    t.equal(val, null);
    t.end();
  });
});

test("authenticate() redirect", function(t) {
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.redirect('http://www.example.com/idp');
  };

  var mockReq = {};
  var mockRes = new (require("http").ServerResponse)(mockReq);
  var options = {};
  var strategy = new Strategy();
  mockRes.end = function() {
    t.equal(mockRes.statusCode, 302);
    t.equal(mockRes._headers.location, "http://www.example.com/idp");
    t.equal(mockRes._headers["content-length"], "0");
    t.end();
  };
  passport.authenticate(mockReq, mockRes, strategy, options, function() {
    t.notOk(true);
  });
});

test("authenticate() redirect with status", function(t) {
  function Strategy() {
  }
  Strategy.prototype.authenticate = function() {
    this.redirect('http://www.example.com/idp', 301);
  };

  var mockReq = {};
  var mockRes = new (require("http").ServerResponse)(mockReq);
  var options = {};
  var strategy = new Strategy();
  mockRes.end = function() {
    t.equal(mockRes.statusCode, 301);
    t.equal(mockRes._headers.location, "http://www.example.com/idp");
    t.equal(mockRes._headers["content-length"], "0");
    t.end();
  };
  passport.authenticate(mockReq, mockRes, strategy, options, function() {
    t.notOk(true);
  });
});
