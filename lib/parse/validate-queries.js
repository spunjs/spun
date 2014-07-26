'use strict';

var CssSelectorParser = require('css-selector-parser').CssSelectorParser;
var parser = new CssSelectorParser();
var errors = require('./errors');

parser.registerNestingOperators('>', '+', '~');
parser.registerAttrEqualityMods('^', '$', '*', '~');

module.exports = function(specs, cb){
  var error = null;

  specs.every(function(spec){
    return spec.lines.every(function(line){
      var args = line.args;

      if(args.query){
        try {
          parser.parse(args.query);
        } catch(e){
          error = new errors.InvalidCssQueryError(line, args.query);
          return false;
        }
      }

      return true;
    });
  });

  cb(error, specs);
};
