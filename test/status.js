var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('status', function(){
  
  it('pause, resume, stop', function(done){
    var traversal = FSTraversal(sdk);
    expect(traversal.status()).to.equal('ready');
    traversal
      .person(function(person){
        if(person.id === '1'){
          // no side effects to calling resume when already running
          traversal.resume();
          expect(traversal.status()).to.equal('running');
          traversal.pause();
          expect(traversal.status()).to.equal('paused');
          // no side effects to calling pause when already paused
          traversal.pause();
          expect(traversal.status()).to.equal('paused');
          traversal.resume();
          expect(traversal.status()).to.equal('running');
          traversal.stop();
          expect(traversal.status()).to.equal('stopped');
          // should not be able to restart traversal once it's been stopped
          traversal.pause();
          traversal.resume();
          expect(traversal.status()).to.equal('stopped');
          done();
        }
      })
      .traverse('1');
    expect(traversal.status()).to.equal('running');
  });
  
  it('done', function(done){
    var traversal = FSTraversal(sdk);
    traversal
      .done(function(){
        expect(traversal.status()).to.equal('done');
        done();
      })
      .traverse('1');
  });
  
});