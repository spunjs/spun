'use strict';

module.exports = function removeUnwantedSpecs(wantedFiles){
  return function(specs, cb){
    cb(null, specs.filter(function(spec){
      return wantedFiles.indexOf(spec.path) > -1;
    }));
  };
};
