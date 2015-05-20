var expect = require('chai').expect,
    FSTraversal = require('../lib/fs-traversal.js'),
    sdk = require('./lib/mock-sdk.js')(require('./graphs/redirect.js'));
    
describe('redirects', function(){
  
  it('properly handle ids of redirected (merged) persons', function(done){
    var traversal = FSTraversal(sdk)
      .person(function(person){
        expect(person.id).to.equal('10');
        expect(traversal.relationshipTo(person.id)).to.equal('yourself');
        expect(traversal.pathTo(person.id)[0].rel).to.equal('start');
        expect(traversal.weight(person.id)).to.equal(0);
      })
      .traverse('1')
      .done(function(){
        done();
      });
  });
  
});