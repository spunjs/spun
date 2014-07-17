'use strict';

module.exports = injectIncludes;

var h = require('../helpers');

/**
 * This function should inject the contents of a spec _after_ the include line.
 * Include lines should be preserved so we have a way to show meaningful stack traces
 * in the event the first line of a file is an include I.E.
 *
 * include "./some-spun-file"
 *
 * This file with a single include would give no context if "./some-spun-file"
 * contained an error.
 */
function injectIncludes(specs, cb){
  var specMap = {};
  var specsWithUnresolvedIncludes = specs.filter(h.bySpecsWithUnresolvedIncludes);

  specs.forEach(function(spec){
    specMap[spec.path] = spec;
  });

  while(specsWithUnresolvedIncludes.length){
    specsWithUnresolvedIncludes.forEach(function(spec){
      var lines = spec.lines, i, line, spliceCommand;

      for(i=0;i<lines.length;i++){
        line = lines[i];
        if(line.command === 'include'){
          line = h.clone(line);
          line.includeResolved = true;
          spliceCommand = [i, 1]
          .concat(line)
          .concat(specMap[line.includePath].lines);
          [].splice.apply(lines, spliceCommand);
        }
      }
    });
    specsWithUnresolvedIncludes = specsWithUnresolvedIncludes
      .filter(h.bySpecsWithUnresolvedIncludes);
  }
  cb(null, specs);
}
