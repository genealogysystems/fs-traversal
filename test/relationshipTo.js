var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('relationshipTo', function(){

  it('should return "yourself"', function(){
    testRel('yourself', [])
  });
  
  it('parents', function(){    
    testRel('father', ['father']);
    testRel('mother', ['mother']);
  });
  
  it('children', function(){    
    testRel('child', ['child']);
    testRel('son', ['son']);
    testRel('daughter', ['daughter']);
  });
  
  it('spouses', function(){    
    testRel('husband', ['husband']);
    testRel('wife', ['wife']);
  });
  
  it('siblings', function(){    
    testRel('brother', ['father', 'son']);
    testRel('brother', ['mother', 'son']);
    testRel('sister', ['father', 'daughter']);
    testRel('sister', ['mother', 'daughter']);
    testRel('sibling', ['father', 'child']);
    testRel('sibling', ['mother', 'child'])
  });
  
  it('grandparents', function(){    
    testRel('grandfather', ['father', 'father']);
    testRel('grandmother', ['father', 'mother']);
    testRel('grandfather', ['mother', 'father']);
    testRel('grandmother', ['mother', 'mother']);
  });
  
  it('great-grandparents', function(){    
    testRel('great-grandfather', ['father', 'father', 'father']);
    testRel('great-grandmother', ['father', 'father', 'mother']);
    testRel('great-grandfather', ['father', 'mother', 'father']);
    testRel('great-grandmother', ['father', 'mother', 'mother']);
    testRel('great-grandfather', ['mother', 'father', 'father']);
    testRel('great-grandmother', ['mother', 'father', 'mother']);
    testRel('great-grandfather', ['mother', 'mother', 'father']);
    testRel('great-grandmother', ['mother', 'mother', 'mother']);
  });
  
  it('nth great grandparents', function(){
    testRel('2nd great-grandmother', ['mother', 'father', 'mother', 'mother']);
    testRel('2nd great-grandmother', ['father', 'mother', 'father', 'mother']);
    testRel('2nd great-grandfather', ['father', 'father', 'mother', 'father']);
    testRel('3rd great-grandfather', ['father', 'father', 'mother', 'father', 'father']);
    testRel('4th great-grandmother', ['father', 'father', 'mother', 'father', 'father', 'mother']);
    testRel('14th great-grandmother', ['father', 'father', 'mother', 'father', 'father', 'mother', 'father', 'mother', 'father', 'father', 'mother', 'father', 'mother', 'father', 'father', 'mother']);
  });
  
  it('grandchildren', function(){    
    testRel('grandson', ['son', 'son']);
    testRel('grandson', ['daughter', 'son']);
    testRel('grandson', ['child', 'son']);
    testRel('granddaughter', ['son', 'daughter']);
    testRel('granddaughter', ['daughter', 'daughter']);
    testRel('granddaughter', ['child', 'daughter']);
    testRel('grandchild', ['son', 'child']);
    testRel('grandchild', ['daughter', 'child']);
    testRel('grandchild', ['child', 'child']);
  });
  
  it('great-grandchildren', function(){
    // Too many possible combinations here to test extensively
    testRel('great-grandson', ['son', 'son', 'son']);
    testRel('great-grandson', ['daughter', 'son', 'son']);
    testRel('great-grandson', ['son', 'daughter', 'son']);
    testRel('great-grandson', ['daughter', 'daughter', 'son']);
  });
  
  it('spouse\'s parents', function(){
    testRel('mother-in-law', ['husband', 'mother']);
    testRel('mother-in-law', ['wife', 'mother']);
    testRel('father-in-law', ['husband', 'father']);
    testRel('father-in-law', ['wife', 'father']);
  });
  
  it('spouses\'s siblings', function(){
    testRel('brother-in-law', ['husband', 'mother', 'son']);
    testRel('brother-in-law', ['husband', 'father', 'son']);
    testRel('brother-in-law', ['wife', 'mother', 'son']);
    testRel('brother-in-law', ['wife', 'father', 'son']);
    testRel('sister-in-law', ['husband', 'mother', 'daughter']);
    testRel('sister-in-law', ['husband', 'father', 'daughter']);
    testRel('sister-in-law', ['wife', 'mother', 'daughter']);
    testRel('sister-in-law', ['wife', 'father', 'daughter']);
    testRel('spouse\'s sibling', ['husband', 'mother', 'child']);
    testRel('spouse\'s sibling', ['husband', 'father', 'child']);
    testRel('spouse\'s sibling', ['wife', 'mother', 'child']);
    testRel('spouse\'s sibling', ['wife', 'father', 'child']);
  });
  
  it('sibling\'s spouses', function(){
    testRel('brother-in-law', ['mother', 'daughter', 'husband']);
    testRel('brother-in-law', ['father', 'daughter', 'husband']);
    testRel('sister-in-law', ['mother', 'son', 'wife']);
    testRel('sister-in-law', ['father', 'son', 'wife']);
  });
  
  it('uncle', function(){
    testRel('uncle', ['mother','mother','son']);
    testRel('uncle', ['mother','father','son']);
    testRel('uncle', ['father','mother','son']);
    testRel('uncle', ['father','father','son']);
  });
  
  it('aunt', function(){
    testRel('aunt', ['mother','mother','daughter']);
    testRel('aunt', ['mother','father','daughter']);
    testRel('aunt', ['father','mother','daughter']);
    testRel('aunt', ['father','father','daughter']);
  });
  
  it('parent\'s sibling', function(){
    testRel('parent\'s sibling', ['mother','mother','child']);
    testRel('parent\'s sibling', ['mother','father','child']);
    testRel('parent\'s sibling', ['father','mother','child']);
    testRel('parent\'s sibling', ['father','father','child']);
  });
  
  it('cousin', function(){
    // Too many possible combinations here to test extensively
    testRel('cousin', ['mother', 'mother', 'daughter', 'daughter']);
    testRel('cousin', ['mother', 'father', 'daughter', 'son']);
    testRel('cousin', ['mother', 'mother', 'son', 'daughter']);
    testRel('cousin', ['father', 'father', 'daughter', 'child']);
  });
  
  it('great-uncle', function(){
    testRel('great-uncle', ['mother','father','mother','son']);
    testRel('great-uncle', ['mother','father','father','son']);
  });
  
  it('great-aunt', function(){
    testRel('great-aunt', ['mother','father','mother','daughter']);
    testRel('great-aunt', ['mother','father','father','daughter']);
  });
  
  it('son-in-law', function(){
    testRel('son-in-law', ['daughter','husband']);
  });
  
  it('daughter-in-law', function(){
    testRel('daughter-in-law', ['son','wife']);
  });
  
  it('niece', function(){
    testRel('niece', ['mother', 'son', 'daughter']);
    testRel('niece', ['father', 'child', 'daughter']);
  });
  
  it('nephew', function(){
    testRel('nephew', ['mother', 'son', 'son']);
    testRel('nephew', ['father', 'child', 'son']);
  });
  
  // TODO: test more compound relationships such as "grandson's wife's cousin"

  it('great uncle\'s child', function(){
    testRel('great-uncle\'s son', ['father', 'father', 'father', 'son', 'son']);
  });
  
});

function testRel(rel, path){
  expect(rel).to.equal(relFromPath(path));
};

/**
 * Returns a relationship string from a path
 */
function relFromPath(path){
  return FSTraversal(sdk)._relationshipTo(genPath(path));
};

/**
 * Generate relationship paths in the syntax fs-traversal expects.
 * We allow gender specific strings so that we can setup the person
 * objects properly with their gender because _relationshipTo will
 * look at the gender.
 */
function genPath(origPath){
  var fullPath = [{
    rel: 'start', 
    person: genPerson('Female')
  }];
  for(var i = 0; i < origPath.length; i++){
    var gender = 'Unknown',
        relationship = origPath[i];
    
    // Setup gender
    if(['wife','daughter','mother'].indexOf(relationship) !== -1){
      gender = 'Female';
    }
    else if(['husband','son','father'].indexOf(relationship) !== -1){
      gender = 'Male';
    }
    
    // Change to gender neutral relationship
    if(['husband','wife'].indexOf(relationship) !== -1){
      relationship = 'spouse';
    }
    else if(['daughter','son'].indexOf(relationship) !== -1){
      relationship = 'child';
    }
    
    fullPath.push({
      rel: relationship, 
      person: genPerson(gender)
    });
  }
  return fullPath;
};

/**
 * Generate a basic person object. _relationshipTo will examine
 * the gender when the path contains the gender neutral strings
 * 'child' or 'spouse'.
 */
function genPerson(gender){
  return {
    gender: {
      type: 'http://gedcomx.org/' + gender
    }
  }
};