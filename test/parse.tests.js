'use strict';

var glob = require('glob');
var should = require('should');
var sutil = require('spun-util');
var errors = sutil.errors;
var path = require('path');
var resolve = path.resolve;
var basename = path.basename;
var dirname = path.dirname;
var toAbsolutePath = require('./helpers/to-absolute-path');

describe('parse', function(){
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
            console.log(err.stack);
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

      it('should not allow ' + basename(test.relative, '.spun'), function(done){
        parse(argv, [absoluePath])(function(err){
          if(!err)return done(new Error('Expected to see an error!'));
          err.should.be.an.instanceOf(errors.ParseError);
          done();
        });
      });
    });
  });

  describe('variable replacement', function(){
    it('should allow default variables from argv', function(done){
      var file = './acceptance/validating/default-variables.spun';
      var variables = {url: 'http://google.com', some:{other:{url: 'http://github.com'}}};
      var argv = {variables: variables};

      parse(argv, [resolve(__dirname, file)])(function(err, specs){
        done();
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
          err.should.be.an.instanceOf(errors.ValidationError);
          done();
        });
      });
    });
  });
});
