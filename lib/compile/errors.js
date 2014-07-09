'use strict';

var sutil = require('spun-util');
var f = require('util').format;
var errors = sutil.errors;
var inherits = require('util').inherits;
var exports = {
  MissingStrategyError: function(strategy){
    this.message = f('The provider had no "%s" method.', strategy);
  }
};

module.exports = exports;
