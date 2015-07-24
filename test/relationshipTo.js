var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('relationshipTo', function(){

  it('return empty string for people that are not fetched', function(){
    var traversal = FSTraversal(sdk);
    expect(traversal.relationshipTo('foo', 'en')).to.equal('');
  });
  
  it('return proper relationship for fetched person', function(done){
    var traversal = FSTraversal(sdk)
      .person(function(person){
        if(person.id === '4'){
          expect(traversal.relationshipTo('4', 'en')).to.equal('mother');
          done();
        }
      })
      .start('1');
  });
  
});