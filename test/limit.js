var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('limit', function(){
  
  it('only visit 2 people', function(done){
    var count = 0;    
    FSTraversal(sdk)
      .limit(2)
      .order('distance')
      .person(function(){
        count++;
      })
      .traverse('1')
      .done(function(){
        expect(count).to.equal(2);
        done();
      });
  });
  
  it('throw error when limit parameter is not a number', function(){
    function invalid(){
      FSTraversal(sdk).limit('qwerty');
    };
    expect(invalid).to.throw(Error);
  })
  
});