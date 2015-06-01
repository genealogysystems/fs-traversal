var expect = require('chai').expect,
    simpleGraph = require('./graphs/simple.js'),
    simpleSDK = require('./lib/mock-sdk.js')(simpleGraph),
    twoChildGraph = require('./graphs/two-children.js'),
    twoChildSDK = require('./lib/mock-sdk.js')(twoChildGraph),
    FSTraversal = require('../lib/fs-traversal.js');
    
describe('children', function(){

  it('simple', function(done){
    var count = 0;
    FSTraversal(simpleSDK)
      .order('distance')
      .children(function(person, children){
        count++;
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
      .start('5')
      .done(function(){
        expect(count).to.equal(5);
        done();
      });
  });
  
  it('children callback for all people', function(done){
    var count = 0;
    FSTraversal(twoChildSDK)
      .order('distance')
      .children(function(person, children){
        count++;
        switch(person.id) {
          case '1':
            expect(children.length).to.equal(2);
            expect(children).to.deep.include.members([{id: '3', name: 'son'},{id: '4', name: 'daughter'}]);
            break;
          case '2':
            expect(children.length).to.equal(2);
            expect(children).to.deep.include.members([{id: '3', name: 'son'},{id: '4', name: 'daughter'}]);
            break;
          case '3':
            expect(children.length).to.equal(0);
            break;
          case '4':
            expect(children.length).to.equal(0);
            break;
        }
      })
      .start('3')
      .done(function(){
        expect(count).to.equal(4);
        done();
      });
  });
  
});var expect = require('chai').expect,
    simpleGraph = require('./graphs/simple.js'),
    simpleSDK = require('./lib/mock-sdk.js')(simpleGraph),
    twoChildGraph = require('./graphs/two-children.js'),
    twoChildSDK = require('./lib/mock-sdk.js')(twoChildGraph),
    FSTraversal = require('../lib/fs-traversal.js');
    
describe('children', function(){

  it('simple', function(done){
    var count = 0;
    FSTraversal(simpleSDK)
      .order('distance')
      .children(function(person, children){
        count++;
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
      .start('5')
      .done(function(){
        expect(count).to.equal(5);
        done();
      });
  });
  
  it('children callback for all people', function(done){
    var count = 0;
    FSTraversal(twoChildSDK)
      .order('distance')
      .children(function(person, children){
        count++;
        switch(person.id) {
          case '1':
            expect(children.length).to.equal(2);
            expect(children).to.deep.include.members([{id: '3', name: 'son'},{id: '4', name: 'daughter'}]);
            break;
          case '2':
            expect(children.length).to.equal(2);
            expect(children).to.deep.include.members([{id: '3', name: 'son'},{id: '4', name: 'daughter'}]);
            break;
          case '3':
            expect(children.length).to.equal(0);
            break;
          case '4':
            expect(children.length).to.equal(0);
            break;
        }
      })
      .start('3')
      .done(function(){
        expect(count).to.equal(4);
        done();
      });
  });
  
});