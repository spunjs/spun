'use strict';

module.exports = injectIncludes;

var h = require('./helpers');

function injectIncludes(specs, cb){
  var specMap = {};
  var specsWithIncludes = specs.filter(h.bySpecsWithIncludes);

  specs.forEach(function(spec){
    specMap[spec.path] = spec;
  });

  while(specsWithIncludes.length){
    specsWithIncludes.forEach(function(spec){
      var lines = spec.lines, i, line, spliceCommand;

      for(i=0;i<lines.length;i++){
        line = lines[i];
        if(line.command === 'include'){
          spliceCommand = [i, 1].concat(specMap[line.args].lines);
          [].splice.apply(lines, spliceCommand);
        }
      }
    });
    specsWithIncludes = specsWithIncludes.filter(h.bySpecsWithIncludes);
  }
  cb(null, specs);
}
