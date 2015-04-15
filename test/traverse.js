var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('traverse', function(){
  
  it('default', function(done){
    FSTraversal(sdk)
      .limit(1)
      .person(function(person){
        expect(person.id).to.equal('1');
        done();
      })
      .traverse();
  });
  
  it('specific person', function(){
    FSTraversal(sdk)
      .limit(1)
      .person(function(person){
        expect(person.id).to.equal('2');
        done();
      })
      .traverse('2');
  });
  
  it('specific person does not exist', function(){
    FSTraversal(sdk)
      .limit(1)
      .error(function(){
        done();
      })
      .traverse('10');
  });
  
});