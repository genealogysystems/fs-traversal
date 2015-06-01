var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('FSTraversal', function(){
  
  it('throw error when sdk is not defined', function(){
    expect(function(){
      FSTraversal();
    }).to.throw(Error);
  });
  
  it('throw error', function(done){
    GLOBAL.SDK_ERROR = true;
    FSTraversal(sdk)
    .traverse('1')
    .error(function(e){
      expect(e).to.exist;
      delete GLOBAL.SDK_ERROR;
      done();
    });
  });
  
  it('concurrency', function(){
    var traversal = FSTraversal(sdk);
    expect(traversal._concurrency).to.equal(5);
    traversal.concurrency(3);
    expect(traversal._concurrency).to.equal(3);
  })
  
});