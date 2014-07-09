'use strict';

module.exports = parse;

var h = require('../helpers');
var errors = require('./errors');

function parse(specSource, readContext, includeResolver, cb) {
  var path = readContext.path;
  var ancestors = readContext.ancestors;

  if (typeof specSource !== 'string') return setImmediate(
    cb,
    new errors.InvalidSpecSourceError(path)
  );

  var lines = specSource
    .split(/\r?\n/)
    .map(h.toLine)
    .map(h.addFileProperty(path))
    .filter(h.byNonEmptyLine)
    .map(h.addCommandProperty);

  if(!lines.length)return setImmediate(cb, new errors.EmptySpecFileError(path));

  var spec = {
    lines: lines,
    path: path,
    source: specSource,
    variables: {}
  };

  var includes = spec.lines
    .filter(h.byCommand('include'));

  var includesWithoutArgs = includes
    .filter(h.hasNoArgs);

  if(includesWithoutArgs.length)return setImmediate(
    cb,
    new errors.IncludeWithoutArgsError(includesWithoutArgs[0], lines)
  );

  includes.forEach(h.stripArgQuotes);
  includes.forEach(function(include){
    includeResolver(include, lines, ancestors);
  });

  return setImmediate(cb, null, spec);
}
