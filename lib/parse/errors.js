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
  InvalidArgumentError: function(line, expected, argTypes){
    this.message = f('Expected to see %s but saw %s in spec %s on line %s', expected, argTypes, line.file, line.number);
  },
  InvalidGetRequestError: function(line, lines){
    this.message = f('The following get command did not resolve to a host: %s', line.tokens[1].value);
    this.stack = getStack(line, lines);
  },
  MissingArgumentError: function(line, command){
    this.message = f('Command %s expected arguments but none were given in spec %s on line %s', command, line.file, line.number);
  },
  MissingCommandError: function(line){
    this.message = f('Expected a command but saw %s column 1 line %s', line.tokens[0].type, line.number);
  },
  NoGetCommandInSpecError: function(spec){
    this.message = f('No get command found in %s', spec.path);
  },
  UnexpectedArgumentError: function(line, command){
    this.message = f('Command %s takes no arguments in spec %s on line %s', command, line.file, line.number);
  },
  UnknownTokenError: function(line, msg){
    this.message = f('An invalid token was found in spec %s on line %s: %s', line.file, line.number, msg);
  },
  VariableReferenceError: function(line, name){
    this.message = f('%s was referenced before it was set in spec %s line %s', name, line.file, line.number);
  }
};

module.exports = exports;

inherits(exports.InvalidArgumentError, errors.ValidationError);
inherits(exports.EmptySpecFileError, errors.ParseError);
inherits(exports.InvalidGetRequestError, errors.ParseError);
inherits(exports.MissingArgumentError, errors.ValidationError);
inherits(exports.MissingCommandError, errors.ValidationError);
inherits(exports.NoGetCommandInSpecError, errors.ValidationError);
inherits(exports.UnexpectedArgumentError, errors.ValidationError);
inherits(exports.UnknownTokenError, errors.ParseError);
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
      name: 'MissingIncludePath',
      message: 'No include path argument was found.'
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
