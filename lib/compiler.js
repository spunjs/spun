'use strict';

module.exports = Compiler;


var sutil = require('spun-util');
var ch = require('./compiler-helpers');
var regex = sutil.regex;
var errors = sutil.errors;

function Compiler (
  globalContext,
  strategyProvider
) {
  this.globalContext = globalContext;
  this.strategyProvider = strategyProvider;
}

Compiler.prototype.parse = function(specSource, path, includeResolver, cb) {
  if (typeof specSource !== 'string') return cb.next(
    new errors.parsing.InvalidSpecSourceError(specSource, path),
    null,
    cb
  );

  //specSource = specSource.replace(regex.emptyLines, '');

  var lines = specSource
    .split(/\r?\n/)
    .map(ch.toLine)
    .filter(ch.byNonEmptyLine)
    .map(ch.addCommandProperty);

  if(!lines.length)return ch.next(new errors.parsing.EmptySpecFileError(path), null, cb);

  var spec = {
    lines: lines,
    path: path,
    source: specSource
  };

  var includes = spec.lines
    .filter(ch.byCommand('include'));

  var includesWithoutArgs = includes
    .filter(ch.hasNoArgs);

  if(includesWithoutArgs.length)return ch.next(new errors.parsing.IncludeWithoutArgsError(spec, includesWithoutArgs[0]), null, cb);

  includes.forEach(ch.stripArgQuotes);
  includes.forEach(function(include){
    includeResolver(spec, include);
  });

  return ch.next(null, spec, cb);
};

Compiler.prototype.validate = function(spec, cb){
  try {
    ch.verifyLineOrderingOf(spec);
    ch.next(null, spec, cb);
  } catch(e) {
    return ch.next(e, null, cb);
  }
};

Compiler.prototype.validateIncludes = function(spec, cb){
  var includes = spec.lines
    .filter(ch.byCommand('include'));

  var unresolveableIncludes = includes
    .filter(ch.byUnresolveableIncludes(path));

  if(unresolveableIncludes.length)return ch.next(
    new errors.parsing.UnresolveableIncludeError(spec, unresolveableIncludes[0]),
    null,
    cb
  );


};

Compiler.prototype.compile = function(spec, cb){
  var path = spec.path;
  var lines = spec.lines;
};
