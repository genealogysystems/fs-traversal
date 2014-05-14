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
          var marriages = _.filter(graph.marriages, function(marriage){
            return _.contains(marriage.spouses, personId);
          });
          return _.map(marriages, function(marriage){
            return _.find(marriage.spouses, function(spouseId){
              return spouseId !== personId;
            });
          });
        }
      
      });
      return deferred.promise;
    }
    
  }

};