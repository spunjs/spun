'use strict';

module.exports = resolveGetCommands;

var sutil = require('spun-util');
var regex = sutil.regex;
var errors = require('./errors');
var h = require('../helpers');
var url = require('url');
var parse = url.parse;
var resolve = url.resolve;

function resolveGetCommands(specs, cb){
  var error = null;

  specs.every(function(spec){
    var lines = spec.lines;
    var getCommands = lines.filter(h.byCommand('get'));
    var lastUrl;

    return getCommands.every(function(line){
      if(!lastUrl) lastUrl = line.args.url;
      var arg = line.args.url;
      var newUrl = resolve(lastUrl, arg);
      var parsed = parse(newUrl);

      if(!parsed.hostname){
        error = new errors.InvalidGetRequestError(line, lines);
        return false;
      }

      lastUrl = newUrl;
      line.args.url = newUrl;

      return true;
    });
  });

  setImmediate(cb, error, specs);
}
