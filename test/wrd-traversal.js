var expect = require('chai').expect,
    graph = require('./graphs/simple.js')
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('traversal - wrd', function(){
  
  it('simple', function(done){
    var weights = {
      1: 1.0,
      2: 4.14,
      3: 2,
      4: 2,
      5: 3.52
    };
    FSTraversal(sdk)
      .order('wrd')
      .person(function(person){
        expect(this._calcWeight(this._fetched[person.id])).to.be.closeTo(weights[person.id], .01);
      })
      .traverse('1')
      .done(function(){
        done();
      });
  });
  
});