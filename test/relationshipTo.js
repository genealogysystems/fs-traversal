var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('relationshipTo', function(){

  it('should return "yourself"', function(){
    var str = FSTraversal(sdk)._relationshipTo(genPath());
    expect(str).to.equal('yourself');
  });
  
  it('parent', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father'));
    expect(str).to.equal('parent');
  });
  
  it('child', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('child'));
    expect(str).to.equal('child');
  });
  
  it('spouse', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('spouse'));
    expect(str).to.equal('spouse');
  });
  
  it('grandparent', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father'));
    expect(str).to.equal('grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'mother'));
    expect(str).to.equal('grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'father'));
    expect(str).to.equal('grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'mother'));
    expect(str).to.equal('grandparent');
  });
  
  it('sibling', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'child'));
    expect(str).to.equal('sibling');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'child'));
    expect(str).to.equal('sibling');
  });
  
  it('grandchild', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('child', 'child'));
    expect(str).to.equal('grandchild');
  });
  
  it('great-grandparent', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father'));
    expect(str).to.equal('great-grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'mother'));
    expect(str).to.equal('great-grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'mother', 'father'));
    expect(str).to.equal('great-grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'mother', 'mother'));
    expect(str).to.equal('great-grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'father', 'father'));
    expect(str).to.equal('great-grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'father', 'mother'));
    expect(str).to.equal('great-grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'mother', 'father'));
    expect(str).to.equal('great-grandparent');
    var str = FSTraversal(sdk)._relationshipTo(genPath('mother', 'mother', 'mother'));
    expect(str).to.equal('great-grandparent');
  });
  
  it('great-grandchild', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('child', 'child', 'child'));
    expect(str).to.equal('great-grandchild');
  });

  it('great uncle\'s child', function(){
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father', 'child', 'child')); 
    expect(str).to.equal('great-uncle\'s child');
  });
  
  it('2nd great-grandparent', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father','father'));
    expect(str).to.equal('2nd great-grandparent');
  });

  it('3rd great-grandparent', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father','father', 'father'));
    expect(str).to.equal('3rd great-grandparent');
  });

  it('4th great-grandparent', function(){    
    var str = FSTraversal(sdk)._relationshipTo(genPath('father', 'father', 'father','father', 'father', 'father'));
    expect(str).to.equal('4th great-grandparent');
  });

});

/**
 * Generate relationship paths in the syntax fs-traversal expects
 */
function genPath(){
  var path = ['1'];
  for(var i = 0; i < arguments.length; i++){
    path.push(arguments[i], '1');
  }
  return path;
};