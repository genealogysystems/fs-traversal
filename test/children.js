var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');
    
describe('children', function(){
  
  it('should return all children', function(done){
        
    FSTraversal(sdk)
      .order('distance')
      .children(function(person, children){
        switch(person.id) {
          case '1':
            expect(children.length).to.equal(1);
            expect(children).to.deep.include.members([{id: '5', name: 'child'}]);
            break;
          case '2':
            expect(children.length).to.equal(1);
            expect(children).to.deep.include.members([{id: '5', name: 'child'}]);
            break;
          case '3':
            expect(children.length).to.equal(1);
            expect(children).to.deep.include.members([{id: '1', name: 'base person'}]);
            break;
          case '4':
            expect(children.length).to.equal(1);
            expect(children).to.deep.include.members([{id: '1', name: 'base person'}]);
            break;
          case '5':
            expect(children.length).to.equal(0);
            break;
        }
      })
      .traverse('1')
      .done(function(){
        done();
      });
  });
  
});