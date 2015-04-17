var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('order', function(){
  
  it('invalid built-in', function(){
    function invalid(){
      FSTraversal(sdk).order('qwerty');
    }
    expect(invalid).to.throw(Error);
  });
  
  it('invalid order', function(){
    function invalid(){
      FSTraversal(sdk).order(123);
    }
    expect(invalid).to.throw(Error);
  });
  
  it('exception when setting order after traversal begins', function(){
    function invalid(){
      FSTraversal(sdk).traverse('1').order('distance');
    }
    expect(invalid).to.throw(Error);
  });
  
  it('custom order - depth-first traversal', function(done){
    var ids = [];
    FSTraversal(require('./lib/mock-sdk.js')(require('./graphs/large.js')))
      .order(function(fetchObj){
        return -1 * fetchObj.distance;
      })
      .filter('ancestry')
      .person(function(person){
        ids.push(person.id);
      })
      .done(function(){
        expect(ids).to.deep.equal(['1','3','4','6','7','13','14','15','16']);
        done();
      })
      .traverse();
  });
  
});