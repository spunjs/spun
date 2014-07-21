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
    var replaceVariables = require('../lib/parse/replace-variables');

    [
      'click',
      'find',
      'get'
    ].forEach(function(command){
      it('should replace string variables for ' + command, function(done){
        var variables = {};

        var lines = [
         {
           tokens: [
             {type: 'command', value: 'set'},
             {type: 'variable', value: 'foo'},
             {type: 'string', value: '"asdf"'}
           ]
         },
         {
           tokens: [
             {type: 'command', value: command},
             {type: 'variable', value: 'foo'}
           ]
         }       
       ];

        var spec = {variables: variables, lines: lines};
        var specs = [spec];

        replaceVariables(specs, function(err, _specs){
          _specs.should.equal(specs);
          variables.foo.should.equal('asdf');
          lines[1].tokens[1].value.should.equal('asdf');
          lines[1].tokens[1].type.should.equal('string');
          done();
        });
      });
    });

    [
      'sleep'
    ].forEach(function(command){
      it('should replace numeric variables for ' + command, function(done){
        var variables = {};
        var lines = [
         {
           tokens: [
             {type: 'command', value: 'set'},
             {type: 'variable', value: 'foo'},
             {type: 'number', value: '5'}
           ]
         },
         {
           tokens: [
             {type: 'command', value: command},
             {type: 'variable', value: 'foo'}
           ]
         }       
       ];
       var spec = {variables: variables, lines: lines};
        var specs = [spec];

        replaceVariables(specs, function(err, _specs){
          should(err).be.null;
          _specs.should.equal(specs);
          variables.foo.should.equal(5);
          lines[1].tokens[1].value.should.equal(5);
          done(err);
        });
      });
    });

    [
      'click',
      'find',
      'get'
    ].forEach(function(command){
      it('should not replace numeric variables for ' + command, function(done){
        var variables = {};
        var lines = [
          {
            tokens: [
              {type: 'command', value: 'set'},
              {type: 'variable', value: 'foo'},
              {type: 'number', value: '5'}
            ]
          },
          {
            tokens: [
              {type: 'command', value: command},
              {type: 'variable', value: 'foo'}
            ]
          }       
        ];

        var spec = {variables: variables, lines: lines};
        var specs = [spec];

        replaceVariables(specs, function(err, _specs){
          err.should.be.an.instanceOf(errors.ParseError);
          done();
        });
      });
    });

    [
      'sleep'
    ].forEach(function(command){
      it('should not replace string variables for ' + command, function(done){
        var variables = {};
        var lines = [
          {
            tokens: [
              {type: 'command', value: 'set'},
              {type: 'variable', value: 'foo'},
              {type: 'string', value: '"asdf"'}
            ]
          },
          {
            tokens: [
              {type: 'command', value: command},
              {type: 'variable', value: 'foo'}
            ]
          }
        ];

        var spec = {variables: variables, lines: lines};
        var specs = [spec];

        replaceVariables(specs, function(err, _specs){
          err.should.be.an.instanceOf(errors.ParseError);
          done();
        });
      });
    });

    it('should return an error when referencing an undefined variable', function(done){
      var variables = {};
      var lines = [
        {
          tokens: [
            {type: 'command', value: 'sleep'},
            {type: 'variable', value: 'foo'}
          ],
        }
      ];
      var spec = {variables: variables, lines: lines};
      var specs = [spec];

      replaceVariables(specs, function(err, _specs){
        err.should.be.an.instanceOf(errors.ParseError);
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
