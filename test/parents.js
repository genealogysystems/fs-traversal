var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('parentstest', function(){
  
  it('should return all parents', function(done){
        
    FSTraversal(sdk)
      .order('distance')
      .parents(function(person, parents){
        switch(person.id) {
          case '1':
            expect(parents.length).to.equal(2);
            expect(parents).to.deep.include.members([ { id: '3', name: 'father' }, { id: '4', name: 'mother' } ]);
            break;
          case '2':
            expect(parents.length).to.equal(0);
            break;
          case '3':
            expect(parents.length).to.equal(0);
            break;
          case '4':
            expect(parents.length).to.equal(0);
            break;
          case '5':
            expect(parents.length).to.equal(2);
            expect(parents).to.deep.include.members([ { id: '1', name: 'base person' },{ id: '2', name: 'spouse' } ]);
            break;
        }
      })
      .traverse('1')
      .done(function(){
        done();
      });
  });
  
});