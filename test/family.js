var expect = require('chai').expect,
    graph = require('./graphs/simple.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('../lib/fs-traversal.js');
    
describe.only('family callback', function(){
  
  it('simple', function(done){
    var count = 0;
    FSTraversal(sdk)
      .order('distance')
      .person(function(person){
        console.log(person.id);
      })
      .family(function(wife, husband, children){
        count++;
        console.log(wife.id, husband.id, children.length, children.map(function(child){
          return child.id;
        }).join(':'));
        if(wife.id === '2'){
          expect(husband.id).to.equal('1');
          expect(children).to.have.length(1);
          expect(children[0].id).to.equal('5');
        } else if(wife.id === '4') {
          expect(husband.id).to.equal('3');
          expect(children).to.have.length(1);
          expect(children[0].id).to.equal('1');
        } else {
          expect(false).to.equal.true;
        }
      })
      .traverse('1')
      .done(function(){
        expect(count).to.equal(2);
        done();
      });
  });
  
})