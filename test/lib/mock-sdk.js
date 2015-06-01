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
  
    getCurrentUser: function(){
      var deferred = Q.defer();
      deferred.resolve({
        getUser: function(){
          return {
            personId: '1'
          }
        }
      });
      return deferred.promise;
    },
  
    // Setup and return a mock person response. Implement some of 
    // the helper functions documented at 
    // http://rootsdev.org/familysearch-javascript-sdk/#/api/person.functions:getPersonWithRelationships
    // which are used by fs-traversal
    getPersonWithRelationships: function(personId){
      var deferred = Q.defer();
      setTimeout(function(){
        
        // Simulate an error
        if(GLOBAL.SDK_ERROR){
          deferred.reject(new Error('Simulating error'));
          return;
        }
        
        // Throw error if the person doesn't exist to mimic 404
        var person = _.find(graph.persons, function(person){
          return person.id === personId;
        });
        if(!person && (!graph.redirects || !graph.redirects[personId])){
          deferred.reject(new Error('person does not exist'));
          return;
        }
        
        deferred.resolve({
        
          getPrimaryId: function(){
            if(graph.redirects && graph.redirects[personId]){
              return graph.redirects[personId];
            } else {
              return personId;
            }
          },
          
          getRequestedId: function(){
            return personId;
          },
          
          wasRedirected: function(){
            return this.getPrimaryId() !== this.getRequestedId();
          },
          
          getPrimaryPerson: function(){
            var primaryId = this.getPrimaryId();
            return _.find(graph.persons, function(person){
              return person.id === primaryId;
            });
          },
          
          getChildIds: function(){
            var primaryId = this.getPrimaryId();
            var childofs = _.filter(graph.childofs, function(childof){
              return childof.father === primaryId || childof.mother === primaryId;
            });
            return _.map(childofs, function(childof){
              return childof.child;
            });
          },
          
          getFatherIds: function(){
            var primaryId = this.getPrimaryId();
            var childofs = _.filter(graph.childofs, function(childof){
              return childof.child === primaryId && childof.father;
            });
            return _.map(childofs, function(childof){
              return childof.father;
            });
          },
          
          getMotherIds: function(){
            var primaryId = this.getPrimaryId();
            var childofs = _.filter(graph.childofs, function(childof){
              return childof.child === primaryId && childof.mother;
            });
            return _.map(childofs, function(childof){
              return childof.mother;
            });
          },
          
          getSpouseIds: function(){
            var primaryId = this.getPrimaryId();
            var marriages = _.filter(graph.marriages, function(marriage){
              return marriage.husband === primaryId || marriage.wife === primaryId;
            });
            return _.map(marriages, function(marriage){
              if(marriage.husband !== primaryId){
                return marriage.husband;
              } else {
                return marriage.wife;
              }
            });
          },
          
          getSpouseRelationships: function(){
            var primaryId = this.getPrimaryId();
            var marriages = _.filter(graph.marriages, function(marriage){
              return marriage.husband === primaryId || marriage.wife === primaryId;
            });
            // Add mock helper functions for spouse relationships
            return _.map(marriages, function(marriage){
              return {
                '$getHusbandId': function(){
                  return marriage.husband;
                },
                '$getWifeId': function(){
                  return marriage.wife;
                }
              };
            });
          },
          
          getChildRelationships: function(){
            var primaryId = this.getPrimaryId();
            var childofs = _.filter(graph.childofs, function(childof){
              return childof.father === primaryId || childof.mother === primaryId;
            });
            return _.map(childofs, parentChildHelper);
          },
          
          getParentRelationships: function(){
            var primaryId = this.getPrimaryId();
            var parentofs = _.filter(graph.childofs, function(childOf){
              return childOf.child === primaryId;
            });
            return _.map(parentofs, parentChildHelper);
          }
        
        });
      });
      return deferred.promise;
    }
    
  }

};

/**
 * Add mock helper functions for parent-child relationships
 */
function parentChildHelper(childof){
  return {
    $getChildId: function(){
      return childof.child;
    },
    $getFatherId: function(){
      return childof.father;
    },
    $getMotherId: function(){
      return childof.mother;
    }
  };
};