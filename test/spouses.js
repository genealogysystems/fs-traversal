var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('spouses', function(){
  
  it('should return all spouses', function(done){
        
    FSTraversal(sdk)
      .order('distance')
      .spouses(function(person, spouses){
        switch(person.id) {
          case '1':
            expect(spouses.length).to.equal(1);
            expect(spouses).to.deep.include.members([ { id: '2', name: 'spouse' } ]);
            break;
          case '2':
            expect(spouses.length).to.equal(1);
            expect(spouses).to.deep.include.members([ { id: '1', name: 'base person' } ]);
            break;
          case '3':
            expect(spouses.length).to.equal(1);
            expect(spouses).to.deep.include.members([ { id: '4', name: 'mother' } ]);
            break;
          case '4':
            expect(spouses.length).to.equal(1);
            expect(spouses).to.deep.include.members([ { id: '3', name: 'father' } ]);
            break;
          case '5':
            expect(spouses.length).to.equal(0);
            break;
        }
      })
      .start('1')
      .done(function(){
        done();
      });
  });
  
});