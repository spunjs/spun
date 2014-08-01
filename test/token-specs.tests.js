'use strict';

describe('token-specs', function(){
  var tokenSpecs = require('../lib/parse/token-specs');

  describe('variable', function(){
    var sut = tokenSpecs[5];
    sut.type.should.equal('variable');
    [
      'asdf.asdf.asdf',
      'asdfasdfasdf',
      'some.url'
    ].forEach(function(string){
      it('should match ' + string, function(){
        var match = sut.regex.exec(string);
        match[0].should.equal(string);
      });
    });
  });
});
