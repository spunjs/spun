'use strict';

module.exports = parse;

var sutil = require('spun-util');
var h = require('./helpers');
var regex = sutil.regex;
var errors = sutil.errors;

function parse(specSource, readContext, includeResolver, cb) {
  var path = readContext.path;
  var ancestors = readContext.ancestors;

  if (typeof specSource !== 'string') return cb.next(
    new errors.parsing.InvalidSpecSourceError(specSource, path),
    null,
    cb
  );

  var lines = specSource
    .split(/\r?\n/)
    .map(h.toLine)
    .filter(h.byNonEmptyLine)
    .map(h.addCommandProperty);

  if(!lines.length)return h.next(new errors.parsing.EmptySpecFileError(path), null, cb);

  var spec = {
    lines: lines,
    path: path,
    source: specSource
  };

  var includes = spec.lines
    .filter(h.byCommand('include'));

  var includesWithoutArgs = includes
    .filter(h.hasNoArgs);

  if(includesWithoutArgs.length)return h.next(new errors.parsing.IncludeWithoutArgsError(spec, includesWithoutArgs[0]), null, cb);

  includes.forEach(h.stripArgQuotes);
  includes.forEach(function(include){
    includeResolver(spec, include, ancestors);
  });

  return h.next(null, spec, cb);
}
