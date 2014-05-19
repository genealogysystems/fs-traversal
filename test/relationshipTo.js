var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('relationshipTo', function(){
  
  it('should return parent', function(){    
    var str = FSTraversal(sdk)._relationshipTo(['1', 'father','2']);
    expect(str).to.equal('parent');
  });

  it('should return great uncle', function(){
    var str = FSTraversal(sdk)._relationshipTo(['1', 'father','2', 'father','3', 'father','4', 'child','5', 'child','6']);
    expect(str).to.equal('great-uncle\'s child');
  });
  
});