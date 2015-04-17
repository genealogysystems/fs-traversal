var expect = require('chai').expect,
    simpleGraph = require('./graphs/simple.js'),
    largeGraph = require('./graphs/large.js'),
    mockSDK = require('./lib/mock-sdk.js'),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('filter - cousins-spouses', function(){
  
  it('simple', function(done){
    
    var visitedPersons = [],
        marriageCount = 0,
        childCount = 0,
        parentCount = 0;
        
    FSTraversal(mockSDK(simpleGraph))
      .filter('cousins-spouses')
      .person(function(person){
        visitedPersons.push(person);
      })
      .marriage(function(wife, husband, marriage){
        expect(visitedPersons).to.deep.include.members([wife]);
        expect(visitedPersons).to.deep.include.members([husband]);
        expect(marriage).to.exist;
        expect(simpleGraph.marriages).to.deep.include.members([{husband: husband.id, wife: wife.id}]);
        marriageCount++;
      })
      .child(function(child, mother, father, relationship){
        expect(visitedPersons).to.deep.include.members([child]);
        expect(visitedPersons).to.deep.include.members([mother]);
        expect(visitedPersons).to.deep.include.members([father]);
        expect(relationship).to.exist;
        expect(simpleGraph.childofs).to.deep.include.members([{child: child.id, father: father.id, mother: mother.id}]);
        childCount++;
      })
      .parent(function(parent, child){
        expect(visitedPersons).to.deep.include.members([parent]);
        expect(visitedPersons).to.deep.include.members([child]);
        parentCount++;
      })
      .traverse('1')
      .done(function(){
        expect(visitedPersons).to.have.length(5);
        expect(childCount).to.equal(2);
        expect(parentCount).to.equal(4);
        done();
      });
  });
  
  it('large', function(done){
    var visitedPersons = [],
        marriageCount = 0,
        childCount = 0,
        parentCount = 0;
    
    FSTraversal(mockSDK(largeGraph))
      .filter('cousins-spouses')
      .person(function(person){
        visitedPersons.push(person);
      })
      .marriage(function(wife, husband, marriage){
        expect(visitedPersons).to.deep.include.members([wife]);
        expect(visitedPersons).to.deep.include.members([husband]);
        expect(marriage).to.exist;
        expect(largeGraph.marriages).to.deep.include.members([{husband: husband.id, wife: wife.id}]);
        marriageCount++;
      })
      .child(function(child, mother, father, relationship){
        expect(visitedPersons).to.deep.include.members([child]);
        expect(visitedPersons).to.deep.include.members([mother]);
        expect(visitedPersons).to.deep.include.members([father]);
        expect(relationship).to.exist;
        expect(largeGraph.childofs).to.deep.include.members([{child: child.id, father: father.id, mother: mother.id}]);
        childCount++;
      })
      .parent(function(parent, child){
        expect(visitedPersons).to.deep.include.members([parent]);
        expect(visitedPersons).to.deep.include.members([child]);
        parentCount++;
      })
      .traverse('1')
      .done(function(){
        expect(visitedPersons).to.have.length(26);
        expect(childCount).to.equal(13);
        expect(parentCount).to.equal(26);
        done();
      });
  });
  
});