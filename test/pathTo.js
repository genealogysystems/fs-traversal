var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('pathTo', function(){

  it('should return empty array when person has not been visited', function(){
    var traversal = FSTraversal(sdk);
    expect(traversal.pathTo('bogus')).to.be.empty;
  });
  
  it('should return array with just start person when called on start person', function(done){
    var traversal = FSTraversal(sdk)
      .order('distance')
      .start('1')
      .done(function(){
        var path = traversal.pathTo('1');
        expect(path).to.have.length(1);
        expect(path[0].person.id).to.equal('1');
        done();
      });
  });
  
  it('should return correct paths', function(done){
    var traversal = FSTraversal(sdk)
      .order('distance')
      .start('1')
      .done(function(){
        expect(traversal.pathTo('2')).to.deep.equal([
          {rel:'start',person:{id:'1',name:'base person'}},
          {rel:'spouse',person:{id:'2',name:'spouse'}}]);
        expect(traversal.pathTo('3')).to.deep.equal([
          {rel:'start',person:{id:'1',name:'base person'}},
          {rel:'father',person:{id:'3',name:'father'}}]);
        expect(traversal.pathTo('4')).to.deep.equal([
          {rel:'start',person:{id:'1',name:'base person'}},
          {rel:'mother',person:{id:'4',name:'mother'}}]);
        expect(traversal.pathTo('5')).to.deep.equal([
          {rel:'start',person:{id:'1',name:'base person'}},
          {rel:'child',person:{id:'5',name:'child'}}]);
        done();
      });
  });

});