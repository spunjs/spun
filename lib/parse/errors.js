'use strict';

var sutil = require('spun-util');
var f = require('util').format;
var errors = sutil.errors;
var getStack = errors.getStack;
var inherits = require('util').inherits;
var exports = {
  EmptySpecFileError: function(path){
    this.message = f('Empty spec file at %s', path);
  },
  InvalidGetRequestError: function(line, lines){
    this.message = f('The following get command did not resolve to a host: %s', line.args);
    this.stack = getStack(line, lines);
  },
  InvalidSpecSourceError: function(name){
    this.message = f('Invalid spec given: %j', name);
  },
  MissingCommandError: function(line){
    this.message = f('Expected a command but saw %s column 1 line %s', line.tokens[0].type, line.number);
  },
  NoGetCommandInSpecError: function(spec){
    this.message = f('No get command found in %s', spec.path);
  },
  UnexpectedArgumentError: function(line, expected, token){
    this.message = f('Expected to see %s but saw %s in spec %s on line %s column %s', expected, token.type, line.file, line.number, token.index + 1);
  },
  UnknownTokenError: function(line, msg){
    this.message = f('An invalid token was found in spec %s on line %s: %s', line.path, line.number, msg);
  },
  VariableReferenceError: function(name, expectedType, actualType, line, lines){
    this.message = f('Expected %s to be a %s but was %s', name, expectedType, actualType);
    this.stack = getStack(line, lines);
  }
};

module.exports = exports;

inherits(exports.InvalidSpecSourceError, errors.ParseError);
inherits(exports.EmptySpecFileError, errors.ParseError);
inherits(exports.InvalidGetRequestError, errors.ParseError);
inherits(exports.MissingCommandError, errors.ParseError);
inherits(exports.NoGetCommandInSpecError, errors.ValidationError);
inherits(exports.UnexpectedArgumentError, errors.ValidationError);
inherits(exports.UnknownTokenError, errors.ValidationError);
inherits(exports.VariableReferenceError, errors.ParseError);

errors.createLineErrors(
  exports,
  errors.ParseError,
  [
    {
      name: 'IncludeWithoutArgsError',
      message: 'An include without a path argument was found.'
    },
    {
      name: 'InfiniteIncludeError',
      message: 'An infinite include was detected.'
    },
    {
      name: 'InvalidIncludePathError',
      message: 'An invalid include path argument was found.'
    },
    {
      name: 'InvalidVariableNameError',
      message: 'Invalid variable name.'
    },
    {
      name: 'InvalidVariableValueError',
      message: 'Invalid variable value.  Expected a string or a number.'
    },
    {
      name: 'SelfReferencingIncludeError',
      message: 'An include that includes itself was found.'
    },
    {
      name: 'UnkownCommandError',
      message: 'Unkown command "%s"'
    }
  ],
  function(msg, line){
    return f(msg, line.command);
  }
);


errors.createLineErrors(
  exports,
  errors.ValidationError,
  [
    {
      name: 'RequiresNumericArgumentError',
      message: 'Command "%s" requires a numeric argument.'
    },
    {
      name: 'RequiresStringArgumentError',
      message: 'Command "%s" requires a string argument.'
    },
    {
      name: 'NeedsGetCommandError',
      message: 'Expected a get command before "%s"'
    },
    {
      name: 'UnknownCommandError',
      message: 'Unknown command: "%s"'
    }
  ],
  function(msg, line){
    return f(msg, line.command);
  }
);
