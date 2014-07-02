/**
 * Utility file for quickly viewing the order which
 * a given traversal algorithm will visit people.
 */
var expect = require('chai').expect,
    graph = require('./graphs/large.js'),
    sdk = require('./lib/mock-sdk.js')(graph),
    FSTraversal = require('./../lib/fs-traversal.js');

var relationships = [],
    order;
    
// Specify which algorithm we're testing
if(process.argv[2]){
  order = process.argv[2];
} else {
  console.error('Error: Must specify an order');
  console.log('Usage: node view-traversal-order.js order');
  process.exit();
}

// Setup/load relationships
var traversal = FSTraversal(sdk)
      .order(order)
      
      // Calc weights for all relationships
      .person(function(person){
        relationships.push({
          name: person.name,
          weight: traversal._calcWeight(traversal._fetched[person.id])
        });
      })
      
      // Print results
      .done(function(){
        for(var i = 0; i < relationships.length; i++){
          console.log('%s\t%d', relationships[i].name, relationships[i].weight);
        }
      })
      
      // Start
      .traverse('1');