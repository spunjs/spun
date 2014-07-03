'use strict';

module.exports = validate;

var h = require('./helpers');

function validate(spec, cb){
  try {
    h.verifyLineOrderingOf(spec);
    h.next(null, spec, cb);
  } catch(e) {
    return h.next(e, null, cb);
  }
}

