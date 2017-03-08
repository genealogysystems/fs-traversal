var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph);
    
describe('Mock SDK', function(){

  it('base person', function(done){
    sdk.getPerson('1').then(function(response){
      expect(response.getPrimaryId()).to.equal('1');
      expect(response.getPrimaryPerson().id).to.equal('1');
      expect(response.getChildIds()).to.deep.equal(['5']);
      expect(response.getFatherIds()).to.deep.equal(['3']);
      expect(response.getMotherIds()).to.deep.equal(['4']);
      expect(response.getSpouseIds()).to.deep.equal(['2']);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(1);
      expect(spouses[0].getHusbandId()).to.equal('1');
      expect(spouses[0].getWifeId()).to.equal('2');
      var children = response.getChildRelationships();
      expect(children).to.have.length(1);
      var parents = response.getParentRelationships();
      expect(parents).to.have.length(1);
      done();
    }).catch(function(e){
      console.log(e);
    });
  });
  
  it('spouse', function(done){
    sdk.getPerson('2').then(function(response){
      expect(response.getPrimaryId()).to.equal('2');
      expect(response.getPrimaryPerson().id).to.equal('2');
      expect(response.getChildIds()).to.deep.equal(['5']);
      expect(response.getFatherIds()).to.deep.equal([]);
      expect(response.getMotherIds()).to.deep.equal([]);
      expect(response.getSpouseIds()).to.deep.equal(['1']);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(1);
      expect(spouses[0].getHusbandId()).to.equal('1');
      expect(spouses[0].getWifeId()).to.equal('2');
      var children = response.getChildRelationships();
      expect(children).to.have.length(1);
      expect(children[0].getChildId()).to.equal('5');
      expect(children[0].getFatherId()).to.equal('1');
      expect(children[0].getMotherId()).to.equal('2');
      var parents = response.getParentRelationships();
      expect(parents).to.have.length(0);
      done();
    }).catch(function(e){
      console.log(e);
    });
  });
  
  it('father', function(done){
    sdk.getPerson('3').then(function(response){
      expect(response.getPrimaryId()).to.equal('3');
      expect(response.getPrimaryPerson().id).to.equal('3');
      expect(response.getChildIds()).to.deep.equal(['1']);
      expect(response.getFatherIds()).to.deep.equal([]);
      expect(response.getMotherIds()).to.deep.equal([]);
      expect(response.getSpouseIds()).to.deep.equal(['4']);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(1);
      expect(spouses[0].getHusbandId()).to.equal('3');
      expect(spouses[0].getWifeId()).to.equal('4');
      var children = response.getChildRelationships();
      expect(children).to.have.length(1);
      expect(children[0].getChildId()).to.equal('1');
      expect(children[0].getFatherId()).to.equal('3');
      expect(children[0].getMotherId()).to.equal('4');
      var parents = response.getParentRelationships();
      expect(parents).to.have.length(0);
      done();
    }).catch(function(e){
      console.log(e);
    });
  });
  
  it('mother', function(done){
    sdk.getPerson('4').then(function(response){
      expect(response.getPrimaryId()).to.equal('4');
      expect(response.getPrimaryPerson().id).to.equal('4');
      expect(response.getChildIds()).to.deep.equal(['1']);
      expect(response.getFatherIds()).to.deep.equal([]);
      expect(response.getMotherIds()).to.deep.equal([]);
      expect(response.getSpouseIds()).to.deep.equal(['3']);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(1);
      expect(spouses[0].getHusbandId()).to.equal('3');
      expect(spouses[0].getWifeId()).to.equal('4');
      var children = response.getChildRelationships();
      expect(children).to.have.length(1);
      expect(children[0].getChildId()).to.equal('1');
      expect(children[0].getFatherId()).to.equal('3');
      expect(children[0].getMotherId()).to.equal('4');
      var parents = response.getParentRelationships();
      expect(parents).to.have.length(0);
      done();
    }).catch(function(e){
      console.log(e);
    });
  });
  
  it('child', function(done){
    sdk.getPerson('5').then(function(response){
      expect(response.getPrimaryId()).to.equal('5');
      expect(response.getPrimaryPerson().id).to.equal('5');
      expect(response.getChildIds()).to.deep.equal([]);
      expect(response.getFatherIds()).to.deep.equal(['1']);
      expect(response.getMotherIds()).to.deep.equal(['2']);
      expect(response.getSpouseIds()).to.deep.equal([]);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(0);
      var children = response.getChildRelationships();
      expect(children).to.have.length(0);
      var parents = response.getParentRelationships();
      expect(parents).to.have.length(1);
      done();
    }).catch(function(e){
      console.log(e);
    });
  });

});