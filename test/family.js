var expect = require('chai').expect,
    simpleGraph = require('./graphs/simple.js'),
    largeGraph = require('./graphs/large.js'),
    simpleSdk = require('./lib/mock-sdk.js')(simpleGraph),
    largeSdk = require('./lib/mock-sdk.js')(largeGraph),
    FSTraversal = require('../lib/fs-traversal.js');
    
describe('family callback', function(){
  
  it('simple', function(done){
    var familyIds = [];
    FSTraversal(simpleSdk)
      .order('distance')
      .family(function(wife, husband, children){
        familyIds.push([wife.id,husband.id].concat(children.map(function(child){
          return child.id;
        })).join(':'));
      })
      .traverse('1')
      .done(function(){
        expect(familyIds).to.have.length(2);
        expect(familyIds).to.have.members([
          '4:3:1',
          '2:1:5'
        ]);
        done();
      });
  });
  
  it('large', function(done){
    var familyIds = [];
    FSTraversal(largeSdk)
      .order('distance')
      .family(function(wife, husband, children){
        var familyId = [wife.id,husband.id].concat(children.map(function(child){
          return child.id;
        })).join(':');
        familyIds.push(familyId);
      })
      .traverse('1')
      .done(function(){
        expect(familyIds).to.have.length(15);
        expect(familyIds).to.have.members([
          '2:1:5',
          '4:3:29:1',
          '33:5:34',
          '20:21:22:2',
          '29:30:31',
          '7:6:8:4',
          '25:24:27:21',
          '9:8:10',
          '14:13:18:6',
          '15:16:14',
          '37:36:35',
          '27:26:28',
          '11:10:12',
          '18:17:19',
          '39:38:37'
        ]);
        done();
      });
  });
  
})