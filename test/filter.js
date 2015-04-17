var expect = require('chai').expect,
    graph = require('./graphs/large.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('filter', function(){
  
  it('should ignore in-laws', function(done){
    
    var persons = 0;
    
    FSTraversal(sdk)
      .order('distance')
      .person(function(person){
        persons++;
      })
      .filter(function(person, relationships){
        // Ignore wife's family
        if(person.name === 'spouse'){
          return {};
        } else {
          return relationships;
        }
      })
      .traverse('1')
      .done(function(){
        expect(persons).to.equal(30);
        done();
      });
  });
  
  it('throw exception when built-in does not exist', function(){
    var invalid = function(){
      FSTraversal(sdk)
        .filter('foo');
    };
    expect(invalid).to.throw(Error);
  });
  
  it('throw exception when not given a string or function', function(){
    var invalid = function(){
      FSTraversal(sdk)
        .filter(123);
    };
    expect(invalid).to.throw(Error);
  });
  
});