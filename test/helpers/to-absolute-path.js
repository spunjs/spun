'use strict';

var path = require('path');
var resolve = path.resolve;

module.exports = function toAbsolutePath(base){
  return function(path){
    return {
      base: base,
      relative: path,
      absolute: resolve(base, path)
    };
  };
};
