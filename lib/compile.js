'use strict';

module.exports = compile;

var h = require('./helpers');
var sutil = require('spun-util');
var errors = sutil.errors;

function compile(argv, provider){
  return function(specs, cb){
    if(!provider.program)return h.next(
      new errors.compiling.MissingStrategyError('program'),
      null,
      cb
    );
    cb(null, specs);
  };
}
