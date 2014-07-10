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
      if(!lastUrl) lastUrl = regex.string.exec(line.args)[1];
      var args = regex.string.exec(line.args)[1];
      var newUrl = resolve(lastUrl, args);
      var parsed = parse(newUrl);

      if(!parsed.hostname){
        error = new errors.InvalidGetRequestError(line, lines);
        return false;
      }

      line.args = '"' + newUrl + '"';

      return true;
    });
  });

  setImmediate(cb, error, specs);
}
