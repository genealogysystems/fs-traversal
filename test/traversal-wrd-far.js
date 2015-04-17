var expect = require('chai').expect,
    simpleGraph = require('./graphs/simple.js'),
    simpleSDK = require('./lib/mock-sdk.js')(simpleGraph),
    largeGraph = require('./graphs/large.js'),
    largeSDK = require('./lib/mock-sdk.js')(largeGraph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('traversal - wrd-far', function(){
  
  it('simple', function(done){
    var weights = {
      1: 0,
      2: 1,
      3: 1,
      4: 1,
      5: 1
    };
    var personCount = 0;
        
    FSTraversal(simpleSDK)
      .order('wrd-far')
      .person(function(person){
        personCount++;
        expect(this._fetched[person.id].weight).to.be.closeTo(weights[person.id], .01);
      })
      .traverse('1')
      .done(function(){
        expect(personCount).to.equal(5);
        done();
      });
  });
  
  it('large', function(done){
    var weights = {
      1: 0,
      2: 1,
      3: 1,
      4: 1,
      5: 1,
      6: 2,
      7: 2,
      34: 2,
      29: 2.8733112435208437,
      13: 3,
      14: 3,
      15: 4,
      16: 4,
      8: 4.788852072534739,
      18: 6.704392901548635,
      33: 8.110399933689347,
      35: 12.165599900534021,
      31: 21.462145992944734,
      10: 30.04700439012262,
      20: 36.348290738886114,
      21: 36.348290738886114,
      19: 38.63186278730052,
      36: 72.69658147777223,
      37: 72.69658147777223,
      30: 87.03329371900503,
      9: 121.84661120660705,
      17: 156.65992869420904,
      12: 173.1359972206445,
      24: 244.35260599490425,
      25: 244.35260599490425,
      22: 390.0561612159873,
      38: 407.2543433248405,
      39: 407.2543433248405,
      32: 546.0786257023823,
      11: 702.1010901887771,
      27: 2447.3546083555975,
      23: 9924.512326660775,
      28: 14102.077370796995,
      26: 57186.743686496986
    };
    var personCount = 0;
        
    FSTraversal(largeSDK)
      .order('wrd-far')
      .person(function(person){
        personCount++;
        expect(this._fetched[person.id].weight).to.be.closeTo(weights[person.id], .01);
      })
      .traverse('1')
      .done(function(){
        expect(personCount).to.equal(39);
        done();
      });
  });
  
});