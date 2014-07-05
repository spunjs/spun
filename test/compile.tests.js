'use strict';

var glob = require('glob');
var sutil = require('spun-util');
var errors = sutil.errors;
var path = require('path');
var resolve = path.resolve;
var basename = path.basename;
var dirname = path.dirname;
var toAbsolutePath = require('./helpers/to-absolute-path');
var read = function(file){return require('fs').readFileSync(file, 'utf-8')+'';};

describe('compile', function(){
  var parse = require('../lib/parse');
  var compile = require('../lib/compile');
  var argv;
  var Provider = require('./helpers/sample-provider');
  var provider;

  beforeEach(function(){
    argv = {};
  });

  describe('compiling errors', function(){
    it('should fail if provider has no strategy for a command', function(done){
      var specs = [{lines:[{command: 'foo'}]}];
      compile(argv, Provider)(specs, function(err){
        err.should.be.an.instanceOf(errors.compiling.MissingStrategyError);
        done();
      });
    });

    it('should fail if a provider strategy fails to remove a line', function(done){
      var specs = [{lines:[{command: 'foo'}]}];
      Provider.prototype.foo = function(){};
      compile(argv, Provider)(specs, function(err){
        delete Provider.prototype.foo;
        err.should.be.an.instanceOf(errors.compiling.StrategyError);
        done();
      });
    });
  });

  describe('compiling', function(){
    glob
    .sync('./acceptance/compiling/passing/*.spun', {cwd: __dirname})
    .map(toAbsolutePath(__dirname))
    .forEach(function(test){
      var absoluePath = test.absolute;
      var result = resolve(dirname(test.absolute), basename(test.absolute, '.spun') + '.txt');
      it('should compile ' + basename(test.relative, '.spun'), function(done){
        parse(argv, [absoluePath])(function(err, specs){
          compile(argv, Provider)(specs, function(err){
            specs[0].compiled.should.equal(read(result));
            done(err);
          });
        });
      });
    });
  });
});
