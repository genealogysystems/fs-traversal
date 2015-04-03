var expect = require('chai').expect,
    FSTraversal = require('../lib/fs-traversal.js');
    
describe('FSTraversal', function(){
  
  it('throw error when sdk is not defined', function(){
    expect(function(){
      FSTraversal();
    }).to.throw(Error);
  })
  
})