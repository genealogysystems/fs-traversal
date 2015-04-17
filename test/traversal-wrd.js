var expect = require('chai').expect,
    simpleGraph = require('./graphs/simple.js'),
    simpleSDK = require('./lib/mock-sdk.js')(simpleGraph),
    largeGraph = require('./graphs/large.js'),
    largeSDK = require('./lib/mock-sdk.js')(largeGraph),
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
    var personCount = 0;
        
    FSTraversal(simpleSDK)
      .order('wrd', {
        gPositive: 1,
        gNegative: 1.76,
        c: 1,
        m: 1.42
      })
      .person(function(person){
        personCount++;
        expect(this._fetched[person.id].weight).to.be.closeTo(weights[person.id], .01);
      })
      .traverse('1')
      .done(function(){
        expect(personCount).to.have.equal(5);
        done();
      });
  });
  
  it('large', function(done){
    var weights = {
      1: 1,
      3: 2,
      4: 2,
      29: 2.718281828459045,
      6: 3,
      7: 3,
      5: 3.52,
      13: 4,
      14: 4,
      2: 4.137120440251392,
      15: 5,
      16: 5,
      34: 5.28,
      8: 5.43656365691809,
      10: 7.3890560989306495,
      18: 8.154845485377136,
      20: 8.274240880502784,
      21: 8.274240880502784,
      30: 11.245859314881844,
      22: 11.245859314881844,
      24: 12.411361320754176,
      25: 12.411361320754176,
      33: 14.5626639496849,
      19: 14.778112197861299,
      35: 21.843995924527352,
      36: 14.5626639496849,
      37: 14.5626639496849,
      38: 4.137120440251392,
      39: 4.137120440251392,
      9: 22.49171862976369,
      27: 22.49171862976369,
      31: 26.009477468235886,
      11: 30.569415021050204,
      28: 30.569415021050204,
      17: 33.73757794464554,
      23: 46.52547443978919,
      12: 70.70108996962058,
      26: 93.05094887957839,
      32: 107.6043408740967
    };
    var personCount = 0;
        
    FSTraversal(largeSDK)
      .order('wrd', {
        gPositive: 1,
        gNegative: 1.76,
        c: 1,
        m: 1.42
      })
      .person(function(person){
        personCount++;
        //console.log('%s: %d,', person.id, this._calcWeight(this._fetched[person.id]));
        expect(this._fetched[person.id].weight).to.be.closeTo(weights[person.id], .01);
      })
      .traverse('1')
      .done(function(){
        expect(personCount).to.have.equal(39);
        done();
      });
  })
  
});