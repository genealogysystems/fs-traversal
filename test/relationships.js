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
            expect(people).to.deep.equal({
              '3': { id: '3', name: 'father' },
              '4': { id: '4', name: 'mother' },
              '5': { id: '5', name: 'child' },
              '2': { id: '2', name: 'spouse' }
            });
            break;
          case '2':
            expect(people).to.deep.equal({
              '5': { id: '5', name: 'child' }, 
              '1': { id: '1', name: 'base person' }
            });
            break;
          case '3':
            expect(people).to.deep.equal({
              '1': { id: '1', name: 'base person' },
              '4': { id: '4', name: 'mother' }
            });
            break;
          case '4':
            expect(people).to.deep.equal({
              '1': { id: '1', name: 'base person' },
              '3': { id: '3', name: 'father' }
            });
            break;
          case '5':
            expect(people).to.deep.equal({
              '1': { id: '1', name: 'base person' },
              '2': { id: '2', name: 'spouse' }
            });
            break;
        }
      })
      .traverse('1')
      .done(function(){
        done();
      });
  });
  
});