'use strict';

var should = require('should');

describe('run', function(){
  var run;
  var specs;
  var argv;
  var report = require('sinon').stub();

  beforeEach(function(){
    argv = {
      browsers: ['chrome'],
      runner: 'node'
    };
    specs = [];
    report.reset();
    run = require('../lib/run')(argv, report);
  });

  describe('running', function(){
    describe('with no specs', function(){
      it('should return normally', function(done){
        run(specs, function(err){
          should(err).not.be.ok;
          done();
        });
      });
    });

    describe('with specs', function(){
      beforeEach(function(){
        specs[0] = {
          compiled: ';'
        };
      });


      describe('with multiple browsers', function(){
        it('should multiply the number of runs', function(done){
          argv.browsers = ['chrome', 'ff', 'opera'];
          run(specs, function(err, contexts){
            should(err).not.be.ok;
            contexts.length.should.equal(3);
            done();
          });
        });
      });

      describe('throwing errors', function(){
        it('should report errors', function(done){
          specs[1] = {
            compiled: 'throw 5;'
          };
          run(specs, function(err, contexts){
            should(err).not.be.ok;
            contexts.length.should.equal(2);
            done();
          });
        });
      });
    });
  });
});
