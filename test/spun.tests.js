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

describe('compile phase', function(){
  var compile = require('../lib/compile');
  var argv;
  var provider;

  beforeEach(function(){
    argv = {};
    provider = {
      get: function(context){},
      program: function(lines, spec, specContext, compilerContext, argv){
        specContext.toString = function(){};
      }
    };
  });

  describe('compiling', function(){
    it('should fail if provider has no "program" strategy', function(done){
      delete provider.program;
      compile(argv, provider)([], function(err){
        err.should.be.an.instanceOf(errors.compiling.MissingStrategyError);
        done();
      });
    });

    it('should fail if provider.program does not provide specContext.toString', function(done){
      var specs = [{command: 'foo'}];
      provider.program = function(){};
      compile(argv, provider)(specs, function(err){
        err.should.be.an.instanceOf(errors.compiling.ProgramStrategyError);
        done();
      });
    });

    it('should fail if provider has no strategy for a command', function(done){
      var specs = [{lines:[{command: 'foo'}]}];
      compile(argv, provider)(specs, function(err){
        err.should.be.an.instanceOf(errors.compiling.MissingStrategyError);
        done();
      });
    });

    it('should fail if a provider strategy fails to remove a line', function(done){
      var specs = [{lines:[{command: 'foo'}]}];
      provider.foo = function(){};
      compile(argv, provider)(specs, function(err){
        err.should.be.an.instanceOf(errors.compiling.StrategyError);
        done();
      });
    });

    it('should compile sources', function(){
      glob
      .sync('./acceptance/compiling/passing/*.spun', {cwd: __dirname})
      .map(toAbsolutePath(__dirname))
      .forEach(function(test){
        var absoluePath = test.absolute;
        var provider = {};

        it('should compile ' + basename(test.relative, '.spun'), function(done){
          compile(argv, [absoluePath])(function(err){
            if(err){
              console.log(err.message);
            }
            done(err);
          });
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
