var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('order', function(){
  
  it('invalid order', function(){
    function invalid(){
      FSTraversal(sdk).order('qwerty');
    }
    expect(invalid).to.throw(Error);
  });
  
  it('exception when setting order after traversal begins', function(){
    function invalid(){
      FSTraversal(sdk).traverse('1').order('distance');
    }
    expect(invalid).to.throw(Error);
  });
  
});