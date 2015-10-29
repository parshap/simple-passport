# simple-passport [![build status](https://secure.travis-ci.org/parshap/simple-passport.svg?branch=master)](http://travis-ci.org/parshap/simple-passport)

A minimal implementation of the core [Passport][] interface to allow
usage of [Passport strategy modules][].

[passport]: http://passportjs.org/
[passport strategy modules]: https://www.npmjs.com/browse/keyword/passport

## Motivation

Passport does a lot of things that I don't want or need:

 * Manages http session (making assumptions about `req.session`)
 * [Handles error messaging and "flash messages"][messages]
 * [Modifies the `req` object and makes assumptions about
   `req.session`][req]
 * [Modifies core `http.IncomingMessage` prototype][incomingmessage]
 * etc.

[incomingmessage]: https://github.com/jaredhanson/passport/blob/aa7420756c2c4d430835c3a694c0281343133bb9/lib/http/request.js#L5
[req]: https://github.com/jaredhanson/passport/blob/aa7420756c2c4d430835c3a694c0281343133bb9/lib/middleware/initialize.js#L45-L51
[messages]: https://github.com/jaredhanson/passport/blob/aa7420756c2c4d430835c3a694c0281343133bb9/lib/middleware/authenticate.js#L95-L123

I've also felt an inversion-of-control problem, where Passport takes
over control flow and makes it difficult to follow execution.

This module is the minimal subset of Passport that I do want and need.
The result is just enough to provide the expected interface to [strategy
modules][passport strategy modules].

**Disclaimer**: This module is not battle-hardened and may not work
with all strategy modules.

## Usage

This module provides an `authenticate()` function that is similar to the
regular `passport.authenticate()` function (provides an entry point
into strategy modules), but with a slightly different interface.

You don't need to register strategies or use middleware.
`authenticate()` is a normal async function that takes inputs and calls
a callback with whether the authentication succeeded. It's up to the
application to perform necessary logic in the callback (e.g., set
`req.user`).

### Example

```js
var passport = require("simple-passport");
var BasicStrategy = require("passport-http").BasicStrategy;
var http = require("http");

var strategy = new BasicStrategy(function(userid, password, callback) {
  callback(null, userid === "foo" && password === "bar");
});

http.createServer(function(req, res) {
  // Authenticate using http basic access authentication
  passport.authenticate(req, res, strategy, function(err, authed) {
    if ( ! authed) {
      res.statusCode = 403;
      res.end("Forbidden");
    }
    else {
      // Authenticated!
      // ...
    }
  });
}).listen();
```

## API

```js
var passport = require("simple-passport");
```

##### `passport.authenticate(req, res, strategy, [options,] callback)`

Perform authentication using the given *strategy object* and call the
callback with the result. This is similar to using the regular
`passport.authenticate()` function with a
["custom callback"][custom callback].

[custom callback]: http://passportjs.org/docs#custom-callback

 * `req`: The current http request, some strategies read headers, etc.
 * `res`: The current http response, some strategies call
   `res.redirect()`, etc.
 * `strategy`: The strategy object to use
 * `options`: Passed to the strategy object's `.authenticate()`
   function *(optional, depends on the strategy)*
 * `callback`: See below

###### `callback(err, result, info, status)`

The callback is later called with the result of the strategy, *except
for when a strategy calls for a redirect*.

 * `err`: An error if one occurred
 * `result`: Result from the strategy (depends on the strategy,
   sometimes a "user object", sometimes a boolean indicating success);
   *falsey* if authentication failed
 * `info`: Some strategies return additional data
 * `status`: Some strategies return a status code
