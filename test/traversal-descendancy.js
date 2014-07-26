var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('traversal - descendancy', function(){
  
  it('simple', function(done){
    
    var visitedPersons = [],
        marriageCount = 0,
        childCount = 0,
        parentCount = 0;
        
    FSTraversal(sdk)
      .order('descendancy')
      .person(function(person){
        visitedPersons.push(person);
      })
      .marriage(function(wife, husband, marriage){
        expect(visitedPersons).to.deep.include.members([wife]);
        expect(visitedPersons).to.deep.include.members([husband]);
        expect(marriage).to.exist;
        expect(graph.marriages).to.deep.include.members([{husband: husband.id, wife: wife.id}]);
        marriageCount++;
      })
      .child(function(child, mother, father, relationship){
        expect(visitedPersons).to.deep.include.members([child]);
        expect(visitedPersons).to.deep.include.members([mother]);
        expect(visitedPersons).to.deep.include.members([father]);
        expect(relationship).to.exist;
        expect(graph.childofs).to.deep.include.members([{child: child.id, father: father.id, mother: mother.id}]);
        childCount++;
      })
      .parent(function(parent, child){
        expect(visitedPersons).to.deep.include.members([parent]);
        expect(visitedPersons).to.deep.include.members([child]);
        parentCount++;
      })
      .traverse('1')
      .done(function(){
        expect(visitedPersons).to.have.length(2);
        expect(childCount).to.equal(0);
        expect(parentCount).to.equal(1);
        done();
      });
  });
  
});