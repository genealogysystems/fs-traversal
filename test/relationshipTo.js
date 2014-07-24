var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('relationshipTo', function(){

  it('should return "yourself"', function(){
    var str = FSTraversal(sdk)._relationshipTo(genPath());
    expect(str).to.equal('yourself');
  });
  
  it('father', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father'));
    expect(str).to.equal('father');
  });
  
  it('son', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('child'));
    expect(str).to.equal('son');
  });
  
  it('husband', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('spouse'));
    expect(str).to.equal('husband');
  });
  
  it('grandparents', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father'));
    expect(str).to.equal('grandfather');
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'mother'));
    expect(str).to.equal('grandmother');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'father'));
    expect(str).to.equal('grandfather');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'mother'));
    expect(str).to.equal('grandmother');
  });
  
  it('brother', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'child'));
    expect(str).to.equal('brother');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'child'));
    expect(str).to.equal('brother');
  });
  
  it('husband\'s parents', function(){
    var str = FSTraversal(sdk)._relationshipTo(genPath('spouse', 'mother'));
    expect(str).to.equal('mother-in-law');
    var str = FSTraversal(sdk)._relationshipTo(genPath('spouse', 'father'));
    expect(str).to.equal('father-in-law');
  });
  
  it('spouses\'s sibling', function(){
    var str = FSTraversal(sdk)._relationshipTo(genPath('spouse', 'mother', 'child'));
    expect(str).to.equal('brother-in-law');
    var str = FSTraversal(sdk)._relationshipTo(genPath('spouse', 'father', 'child'));
    expect(str).to.equal('brother-in-law');
  });
  
  it('grandson', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('child', 'child'));
    expect(str).to.equal('grandson');
  });
  
  it('great-grandparent', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father'));
    expect(str).to.equal('great-grandfather');
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'mother'));
    expect(str).to.equal('great-grandmother');
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'mother', 'father'));
    expect(str).to.equal('great-grandfather');
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'mother', 'mother'));
    expect(str).to.equal('great-grandmother');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'father', 'father'));
    expect(str).to.equal('great-grandfather');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'father', 'mother'));
    expect(str).to.equal('great-grandmother');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'mother', 'father'));
    expect(str).to.equal('great-grandfather');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'mother', 'mother'));
    expect(str).to.equal('great-grandmother');
  });
  
  it('great-grandson', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('child', 'child', 'child'));
    expect(str).to.equal('great-grandson');
  });

  it('great uncle\'s child', function(){
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father', 'child', 'child')); 
    expect(str).to.equal('great-uncle\'s son');
  });
  
  it('2nd great-grandfather', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father','father'));
    expect(str).to.equal('2nd great-grandfather');
  });

  it('3rd great-grandfather', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father','father', 'father'));
    expect(str).to.equal('3rd great-grandfather');
  });

  it('4th great-grandmother', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father','mother', 'father', 'mother'));
    expect(str).to.equal('4th great-grandmother');
  });

});

/**
 * Generate relationship paths in the syntax fs-traversal expects
 */
function genPath(){
  var path = [{rel:'start',person:genPerson()}];
  for(var i = 0; i < arguments.length; i++){
    path.push({rel:arguments[i], person:genPerson()});
  }
  return path;
};
function genPerson(){
  return {
    gender: {
      type: 'http://gedcomx.org/Male'
    }
  }
};