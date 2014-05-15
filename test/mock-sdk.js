var expect = require('chai').expect,
    graph = require('./graphs/simple.js')
    sdk = require('./lib/mock-sdk.js')(graph);
    
describe('Mock SDK', function(){

  it('base person', function(done){
    sdk.getPersonWithRelationships('1').then(function(response){
      expect(response.getPrimaryId()).to.equal('1');
      expect(response.getPrimaryPerson().id).to.equal('1');
      expect(response.getChildIds()).to.deep.equal(['5']);
      expect(response.getFatherIds()).to.deep.equal(['3']);
      expect(response.getMotherIds()).to.deep.equal(['4']);
      expect(response.getSpouseIds()).to.deep.equal(['2']);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(1);
      expect(spouses[0].$getHusbandId()).to.equal('1');
      expect(spouses[0].$getWifeId()).to.equal('2');
      var childParents = response.getChildRelationships();
      expect(childParents).to.have.length(2);
      done();
    }).fail(function(e){
      console.log(e);
    });
  });
  
  it('spouse', function(done){
    sdk.getPersonWithRelationships('2').then(function(response){
      expect(response.getPrimaryId()).to.equal('2');
      expect(response.getPrimaryPerson().id).to.equal('2');
      expect(response.getChildIds()).to.deep.equal(['5']);
      expect(response.getFatherIds()).to.deep.equal([]);
      expect(response.getMotherIds()).to.deep.equal([]);
      expect(response.getSpouseIds()).to.deep.equal(['1']);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(1);
      expect(spouses[0].$getHusbandId()).to.equal('1');
      expect(spouses[0].$getWifeId()).to.equal('2');
      var childParents = response.getChildRelationships();
      expect(childParents).to.have.length(1);
      expect(childParents[0].$getChildId()).to.equal('5');
      expect(childParents[0].$getFatherId()).to.equal('1');
      expect(childParents[0].$getMotherId()).to.equal('2');
      done();
    }).fail(function(e){
      console.log(e);
    });
  });
  
  it('father', function(done){
    sdk.getPersonWithRelationships('3').then(function(response){
      expect(response.getPrimaryId()).to.equal('3');
      expect(response.getPrimaryPerson().id).to.equal('3');
      expect(response.getChildIds()).to.deep.equal(['1']);
      expect(response.getFatherIds()).to.deep.equal([]);
      expect(response.getMotherIds()).to.deep.equal([]);
      expect(response.getSpouseIds()).to.deep.equal(['4']);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(1);
      expect(spouses[0].$getHusbandId()).to.equal('3');
      expect(spouses[0].$getWifeId()).to.equal('4');
      var childParents = response.getChildRelationships();
      expect(childParents).to.have.length(1);
      expect(childParents[0].$getChildId()).to.equal('1');
      expect(childParents[0].$getFatherId()).to.equal('3');
      expect(childParents[0].$getMotherId()).to.equal('4');
      done();
    }).fail(function(e){
      console.log(e);
    });
  });
  
  it('mother', function(done){
    sdk.getPersonWithRelationships('4').then(function(response){
      expect(response.getPrimaryId()).to.equal('4');
      expect(response.getPrimaryPerson().id).to.equal('4');
      expect(response.getChildIds()).to.deep.equal(['1']);
      expect(response.getFatherIds()).to.deep.equal([]);
      expect(response.getMotherIds()).to.deep.equal([]);
      expect(response.getSpouseIds()).to.deep.equal(['3']);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(1);
      expect(spouses[0].$getHusbandId()).to.equal('3');
      expect(spouses[0].$getWifeId()).to.equal('4');
      var childParents = response.getChildRelationships();
      expect(childParents).to.have.length(1);
      expect(childParents[0].$getChildId()).to.equal('1');
      expect(childParents[0].$getFatherId()).to.equal('3');
      expect(childParents[0].$getMotherId()).to.equal('4');
      done();
    }).fail(function(e){
      console.log(e);
    });
  });
  
  it('child', function(done){
    sdk.getPersonWithRelationships('5').then(function(response){
      expect(response.getPrimaryId()).to.equal('5');
      expect(response.getPrimaryPerson().id).to.equal('5');
      expect(response.getChildIds()).to.deep.equal([]);
      expect(response.getFatherIds()).to.deep.equal(['1']);
      expect(response.getMotherIds()).to.deep.equal(['2']);
      expect(response.getSpouseIds()).to.deep.equal([]);
      var spouses = response.getSpouseRelationships();
      expect(spouses).to.have.length(0);
      var childParents = response.getChildRelationships();
      expect(childParents).to.have.length(1);
      done();
    }).fail(function(e){
      console.log(e);
    });
  });

});