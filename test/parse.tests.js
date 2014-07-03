'use strict';

var glob = require('glob');
var sutil = require('spun-util');
var errors = sutil.errors;
var path = require('path');
var resolve = path.resolve;
var basename = path.basename;
var dirname = path.dirname;

describe('parse phase', function(){
  var parse = require('../lib/parse');
  var argv = {workerCount: 5};
  var strategyProvider = {};

  describe('parsing', function(){
    glob
    .sync('./acceptance/parsing/passing/*.spun', {cwd: __dirname})
    .map(toAbsolutePath(__dirname))
    .forEach(function(test){
      it('should allow ' + basename(test.relative, '.spun'), function(done){
        parse(argv, [test.absolute])(function(err){
          if(err){
            console.log(err.message);
          }
          done(err);
        });
      });
    });

    glob
    .sync('./acceptance/parsing/failing/*.spun', {cwd: __dirname})
    .map(toAbsolutePath(__dirname))
    .forEach(function(test){
      var absoluePath = test.absolute;
      var errorPath = resolve(dirname(absoluePath), basename(absoluePath, '.spun') + '.js');
      var error = require(errorPath);

      it('should not allow ' + basename(test.relative, '.spun'), function(done){
        parse(argv, [absoluePath])(function(err){
          if(!err)return done(new Error('Expected to see an error!'));
          err.should.be.an.instanceOf(error);
          done();
        });
      });
    });
  });

  describe('validating', function(){
    glob
    .sync('./acceptance/validating/failing/*.spun', {cwd: __dirname})
    .map(toAbsolutePath(__dirname))
    .forEach(function(test){
      var absoluePath = test.absolute;

      it('should not allow ' + basename(test.relative, '.spun'), function(done){
        parse(argv, [absoluePath])(function(err){
          if(!err)return done(new Error('Expected to see an error!'));
          err.should.be.an.instanceOf(errors.validating.ValidationError);
          done();
        });
      });
    });
  });
});

function toAbsolutePath(base){
  return function(path){
    return {
      base: base,
      relative: path,
      absolute: resolve(base, path)
    };
  };
}
