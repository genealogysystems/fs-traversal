var expect = require('chai').expect,
    wrds = require('./lib/wrds.js'),
    traverse = require('./../lib/fs-traversal.js')({}).wrd({
      gPositive: 1,
      gNegative: 1.76,
      c: 1,
      m: 1.42
    });
    
describe('_calcWeight', function(){

  describe('wrd', function(){
  
    it('base person', function(){     
      var weight = traverse._calcWeight({wrd: wrds['base person']});
      expect(weight).to.equal(1);
    });
    
    it('parents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['parents']});
      expect(weight).to.equal(2);
    });
    
    it('siblings', function(){     
      var weight = traverse._calcWeight({wrd: wrds['siblings']});
      expect(weight).to.be.closeTo(2.72, .01);
    });
    
    it('grandparents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['grandparents']});
      expect(weight).to.equal(3);
    });
    
    it('children', function(){     
      var weight = traverse._calcWeight({wrd: wrds['children']});
      expect(weight).to.be.closeTo(3.52, .01);
    });
    
    it('great grandparents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['great grandparents']});
      expect(weight).to.equal(4);
    });
    
    it('spouse', function(){     
      var weight = traverse._calcWeight({wrd: wrds['spouse']});
      expect(weight).to.be.closeTo(4.14, .01);
    });
    
    it('2g grandparents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['2g grandparents']});
      expect(weight).to.equal(5);
    });
    
    it('grandchildren', function(){     
      var weight = traverse._calcWeight({wrd: wrds['grandchildren']});
      expect(weight).to.be.closeTo(5.28, .01);
    });
    
    it('aunts and uncles', function(){     
      var weight = traverse._calcWeight({wrd: wrds['aunts and uncles']});
      expect(weight).to.be.closeTo(5.44, .01);
    });
    
    it('3g grandparents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['3g grandparents']});
      expect(weight).to.equal(6);
    });
    
    it('4g grandparents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['4g grandparents']});
      expect(weight).to.equal(7);
    });
    
    it('great grandchildren', function(){     
      var weight = traverse._calcWeight({wrd: wrds['great grandchildren']});
      expect(weight).to.be.closeTo(8.8, .01);
    });
    
    it('1st cousins', function(){     
      var weight = traverse._calcWeight({wrd: wrds['1st cousins']});
      expect(weight).to.be.closeTo(3.52, .01);
    });
    
    it('5g grandparents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['5g grandparents']});
      expect(weight).to.equal(8);
    });
    
    it('great aunts and uncles', function(){     
      var weight = traverse._calcWeight({wrd: wrds['great aunts and uncles']});
      expect(weight).to.be.closeTo(8.15, .01);
    });
    
    it('parents-in-law', function(){     
      var weight = traverse._calcWeight({wrd: wrds['parents-in-law']});
      expect(weight).to.be.closeTo(8.27, .01);
    });
    
    it('6g grandparents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['6g grandparents']});
      expect(weight).to.equal(9);
    });
    
    it('nieces and nephews', function(){     
      var weight = traverse._calcWeight({wrd: wrds['nieces and nephews']});
      expect(weight).to.be.closeTo(9.57, .01);
    });
    
    it('7g grandparents', function(){     
      var weight = traverse._calcWeight({wrd: wrds['7g grandparents']});
      expect(weight).to.equal(10);
    });
  
  });

});