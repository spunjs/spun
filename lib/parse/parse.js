'use strict';

module.exports = parse;

var h = require('../helpers');
var errors = require('./errors');
var string = /"([^"]+)?"/;
var simple = require('tokenize').simple;
var tokenSpecs = [
  {type: 'command', regex: /(?:click|close|find|get|include|quit|refresh|set|sleep|submit|type)(?=\s|$)/},
  {type: 'in', regex: /(?:in)(?=\s)/},
  {type: 'operator', regex: /(?:equal|or|and)(?=\s)/},
  {type: 'string', regex: string},
  {type: 'number', regex: /[0-9]+/},
  {type: 'variable', regex: /[a-zA-Z](?:[a-zA-Z0-9_]+)/},
  {type: 'space', regex: /\s+/}
];

function parse(specSource, readContext, includeResolver, cb) {
  var path = readContext.path;
  var ancestors = readContext.ancestors;
  var error = null;

  var lines = specSource
    .split(/\r?\n/)
    .map(h.toLine)
    .map(h.addFileProperty(path))
    .filter(h.byNonEmptyLine);

  if(!lines.length)return setImmediate(cb, new errors.EmptySpecFileError(path));

  lines.every(function(line){
    var command;
    try {
      line.tokens = simple(line.text, tokenSpecs);
    } catch(e) {
      error = new errors.UnknownTokenError(line, e.message);
      return false;
    }
    command = line.tokens[0];
    if(command.type !== 'command'){
      error = new errors.MissingCommandError(line);
      return false;
    }
    line.tokens = line.tokens.filter(bySpace);
    line.command = command.value;
    return true;
  });

  if(error)return setImmediate(cb, error);

  var spec = {
    lines: lines,
    path: path,
    source: specSource,
    variables: {}
  };

  var includes = spec.lines
    .filter(h.byCommand('include'));

  includes.forEach(function(include){
    includeResolver(include, lines, ancestors);
  });

  return setImmediate(cb, null, spec);
}

function bySpace(token){
  return token.type !== 'space';
}
