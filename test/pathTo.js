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
      .traverse('1')
      .done(function(){
        var path = traversal.pathTo('1');
        expect(path).to.have.length(1);
        expect(path[0].id).to.equal('1');
        done();
      });
  });
  
  it('should return correct paths', function(done){
    var traversal = FSTraversal(sdk)
      .order('distance')
      .traverse('1')
      .done(function(){
        expect(traversal.pathTo('2')).to.deep.equal([{id:'1',name:'base person'},'spouse',{id:'2',name:'spouse'}]);
        expect(traversal.pathTo('3')).to.deep.equal([{id:'1',name:'base person'},'father',{id:'3',name:'father'}]);
        expect(traversal.pathTo('4')).to.deep.equal([{id:'1',name:'base person'},'mother',{id:'4',name:'mother'}]);
        expect(traversal.pathTo('5')).to.deep.equal([{id:'1',name:'base person'},'child',{id:'5',name:'child'}]);
        done();
      });
  });
  
  it('more complicated example', function(){
    var getPerson = function(id, name){
      return {
        getPrimaryPerson: function(){
          return {
            id: id,
            display: {
              name: name
            }
          }
        }
      };
    };
    var traversal = FSTraversal(sdk);
    traversal._fetched['fmcsm'] = {
      path: ['start','father','f','mother','fm','child','fmc','spouse','fmcs','mother','fmcsm']
    };
    traversal._visited['start'] = getPerson('start', 'Start Person');
    traversal._visited['f'] = getPerson('f', 'Father');
    traversal._visited['fm'] = getPerson('fm', 'Fathers Mother');
    traversal._visited['fmc'] = getPerson('fmc', 'Fathers Mothers Child');
    traversal._visited['fmcs'] = getPerson('fmcs', 'Fathers Mothers Childs Spouse');
    traversal._visited['fmcsm'] = getPerson('fmcsm', 'Fathers Mothers Childs Spouses Mother');

    var path = traversal.pathTo('fmcsm');
    expect(path).to.have.length(11);
    expect(path[0]).to.have.property('id', 'start');
    expect(path[0]).to.have.deep.property('display.name', 'Start Person');
    expect(path[1]).to.equal('father');
    expect(path[2]).to.have.property('id', 'f');
    expect(path[2]).to.have.deep.property('display.name', 'Father');
    expect(path[3]).to.equal('mother');
    expect(path[4]).to.have.property('id', 'fm');
    expect(path[4]).to.have.deep.property('display.name', 'Fathers Mother');
    expect(path[5]).to.equal('child');
    expect(path[6]).to.have.property('id', 'fmc');
    expect(path[6]).to.have.deep.property('display.name', 'Fathers Mothers Child');
    expect(path[7]).to.equal('spouse');
    expect(path[8]).to.have.property('id', 'fmcs');
    expect(path[8]).to.have.deep.property('display.name', 'Fathers Mothers Childs Spouse');
    expect(path[9]).to.equal('mother');
    expect(path[10]).to.have.property('id', 'fmcsm');
    expect(path[10]).to.have.deep.property('display.name', 'Fathers Mothers Childs Spouses Mother');
  });
});