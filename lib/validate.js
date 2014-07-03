'use strict';

module.exports = validate;

var h = require('./helpers');

function validate(specs, cb){
  var spec, len=specs.length, i;
  for(i=0;i<len;i++){
    spec = specs[i];
    try {
    } catch(e) {
      return h.next(e, null, cb);
    }
  }
  h.next(null, specs, cb);
}
