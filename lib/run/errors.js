'use strict';

var sutil = require('spun-util');
var f = require('util').format;
var errors = sutil.errors;
var inherits = require('util').inherits;
var exports = {
  ExitedWithBadCodeError: function ExitedWithBadCodeError(code, spec){
    this.message = f('Spec %s exited with code %s', spec.path, code);
  }
};

module.exports = exports;
