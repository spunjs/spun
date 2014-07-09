'use strict';

var sutil = require('spun-util');
var f = require('util').format;
var errors = sutil.errors;
var inherits = require('util').inherits;
var exports = {
  InvalidSpecSourceError: function(name){
    this.message = f('Invalid spec given: %j', name);
  },
  EmptySpecFileError: function(path){
    this.message = f('Empty spec file at %s', path);
  }
};

module.exports = exports;

inherits(exports.InvalidSpecSourceError, errors.ParseError);
inherits(exports.EmptySpecFileError, errors.ParseError);

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
      name: 'SelfReferencingIncludeError',
      message: 'An include that includes itself was found.'
    }
  ]
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
