"use strict";

var dezalgo = require("dezalgo");
var assign = require("object.assign/polyfill")();

var SimplePassport = {
  authenticate: function(req, res, strategy, options, callback) {
    if (typeof options === "function") {
      callback = options;
      options = null;
    }

    callback = dezalgo(callback);
    strategy = Object.create(strategy);
    assign(strategy, {
      success: callback.bind(null, null), // callback(null, user)
      error: callback.bind(null), // callback(err)
      pass: callback.bind(null, null, null), // callback(null, null)
      fail: function(info, status) {
        if (typeof info === "number") {
          status = info;
          info = undefined;
        }
        callback(null, false, info, status);
      },
      redirect: function(url, status) {
        res.statusCode = status || 302;
        res.setHeader('Location', url);
        res.setHeader('Content-Length', '0');
        res.end();
      },
    });
    strategy.authenticate(req, options);
  },
};

module.exports = SimplePassport;
