var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('relationships', function(){
  
  it('should return all relationships', function(done){
        
    FSTraversal(sdk)
      .order('distance')
      .relationships(function(person, relationships, people){
        switch(person.id) {
          case '1':
            expect(people.length).to.equal(4);
            expect(people).to.deep.include.members([
              { id: '3', name: 'father' },
              { id: '4', name: 'mother' },
              { id: '5', name: 'child' },
              { id: '2', name: 'spouse' }
            ]);
            break;
          case '2':
            expect(people.length).to.equal(2);
            expect(people).to.deep.include.members([
              { id: '5', name: 'child' }, 
              { id: '1', name: 'base person' }
            ]);
            break;
          case '3':
            expect(people.length).to.equal(2);
            expect(people).to.deep.include.members([
              { id: '1', name: 'base person' },
              { id: '4', name: 'mother' }
            ]);
            break;
          case '4':
            expect(people.length).to.equal(2);
            expect(people).to.deep.include.members([
              { id: '1', name: 'base person' },
              { id: '3', name: 'father' }
            ]);
            break;
          case '5':
            expect(people.length).to.equal(2);
            expect(people).to.deep.include.members([
              { id: '1', name: 'base person' },
              { id: '2', name: 'spouse' }
            ]);
            break;
        }
      })
      .traverse('1')
      .done(function(){
        done();
      });
  });
  
});