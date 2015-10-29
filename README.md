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

I also feel there is an inversion-of-control problem where Passport
takes over the control flow of your application and makes it hard to
follow execution.

So I decided to try and find the minimal subset of Passport that I do
want and need. It ends up being just enough to provide the expected
interface to *strategy modules*.

## Usage

This module provides a `authenticate()` function that is similar to the
regular `passport.authenticate()` function and provides the same
function (entry point into a strategy module), but with a slightly
different interface.

You don't need to register any strategies or use middleware functions.
`authenticate()` is a normal async function that takes some inputs and
calls a callback with whether or not the authentication succeeded. It's
up to the application to perform the necessary logic in the callback
(e.g., set `req.user`).

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

#### `passport.authenticate(req, res, strategy, [options,] callback)`

Perform authentication using the given *strategy object* and call the
callback with the result. This is similar to using the regular Passport
`authenticate()` function with a ["custom callback"][custom callback].

[custom callback]: http://passportjs.org/docs#custom-callback

 * `req`: The current http request, some strategies read headers, etc.
 * `res`: The current http response, some strategies call
   `res.redirect()`, etc.
 * `strategy`: A strategy object to use
 * `options`: Passed to the strategy object's `.authenticate()`
   function *(Optional)*
 * `callback`: See below

##### `callback(err, result, info, status)`

The callback is later called with the result of the strategy, *except
for when a strategy calls for a redirect*.

 * `err`: An error if one occurred
 * `result`: Result from the strategy (depends on the strategy,
   sometimes a "user object", sometimes a boolean indicating success);
   *falsey* if authentication failed
 * `info`: Some strategies return additional data
 * `status`: Some strategies return a status code
