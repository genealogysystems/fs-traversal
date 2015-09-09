var expect = require('chai').expect,
    graph = require('../graphs/simple.js'),
    sdk = require('../lib/mock-sdk.js')(graph),
    FSTraversal = require('../../lib/fs-traversal.js');

module.exports = testRel;

function testRel(lang, rel, path){
  expect(relFromPath(lang, path)).to.equal(rel);
}

/**
 * Returns a relationship string from a path
 */
function relFromPath(lang, path){
  return FSTraversal(sdk)._relationshipTo(genPath(path), lang);
}

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
}

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
  };
}