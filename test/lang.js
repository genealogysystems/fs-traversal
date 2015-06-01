var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('lang', function(){

  it('register', function(){
    FSTraversal.lang({
      code: 'foo',
      base: 'Foo',
      patterns: [
        {
          pattern: '.*',
          rel: 'bar'
        }
      ],
      join: function(rels){
        return rels.join("-");
      }
    });
    expect(FSTraversal._langs['foo']).to.exist;
  });
  
  it('use custom lang', function(){
    var traversal = new FSTraversal(sdk);
    expect(traversal.relationshipTo('qwerty', 'foo')).to.equal('');
    expect(traversal._relationshipTo([{}], 'foo')).to.equal('Foo');
  });
  
  it('throw error when lang param does not exist', function(done){
    var traversal = FSTraversal(sdk)
      .start('1')
      .done(function(){
        expect(function(){
          traversal.relationshipTo('4');
        }).to.throw('Language code is required.');
        done();
      });
  });
  
  it('throw error when calling lang that does not exist', function(done){
    var traversal = FSTraversal(sdk)
      .start('1')
      .done(function(){
        expect(function(){
          traversal.relationshipTo('4', 'frazzle');
        }).to.throw('Language frazzle has not been registered.');
        done();
      });
  });
  
});