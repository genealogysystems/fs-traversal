/**
 * A mock version of the familysearch-javascript-sdk that
 * only implements the functionality which fs-traversal uses.
 * This enables us to test fs-traversal without needing to
 * make real requests to the FS API.
 */

var Q = require('q'),
    _ = require('lodash');

module.exports = function(graph) {

  // Setup and return the mock SDK object
  return {
  
    // Setup and return a mock person response. Implement some of 
    // the helper functions documented at 
    // http://rootsdev.org/familysearch-javascript-sdk/#/api/person.functions:getPersonWithRelationships
    // which are used by fs-traversal
    getPersonWithRelationships: function(personId){
      var deferred = Q.defer();
      deferred.resolve({
      
        getPrimaryId: function(){
          return personId;
        },
        
        getPrimaryPerson: function(){
          return _.find(graph.persons, function(person){
            return person.id === personId;
          });
        },
        
        getChildIds: function(){
          var childofs = _.filter(graph.childofs, function(childof){
            return childof.father === personId || childof.mother === personId;
          });
          return _.map(childofs, function(childof){
            return childof.child;
          });
        },
        
        getFatherIds: function(){
          var childofs = _.filter(graph.childofs, function(childof){
            return childof.child === personId;
          });
          return _.map(childofs, function(childof){
            return childof.father;
          });
        },
        
        getMotherIds: function(){
          var childofs = _.filter(graph.childofs, function(childof){
            return childof.child === personId;
          });
          return _.map(childofs, function(childof){
            return childof.mother;
          });
        },
        
        getSpouseIds: function(){
          var marriages = this.getSpouseRelationships();
          return _.map(marriages, function(marriage){
            if(marriage.husband !== personId){
              return marriage.husband;
            } else {
              return marriage.wife;
            }
          });
        },
        
        getSpouseRelationships: function(){
          var marriages = _.filter(graph.marriages, function(marriage){
            return marriage.husband === personId || marriage.wife === personId;
          });
          // Add mock helper functions for spouse relationships
          return _.map(marriages, function(marriage){
            marriage.$getHusbandId = function(){
              return marriage.husband;
            };
            marriage.$getWifeId = function(){
              return marriage.wife;
            };
            return marriage;
          });
        }
      
      });
      return deferred.promise;
    }
    
  }

};