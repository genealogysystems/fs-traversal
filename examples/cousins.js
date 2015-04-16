FSTraversal(fsClient)
  .order('distance')
  .limit(50)
  // For details about how the filter function works,
  // see https://github.com/genealogysystems/fs-traversal#filterfunction
  .filter(function(person, relationships){
    var persons = {};
    for(var id in relationships){
      var rel = relationships[id];
      if(isAncestorDescendantOrCousin(rel)){
        persons[id] = rel;
      } else {
        console.log('ignoring ' + rel.path[rel.path.length-1].person_id)
      }
    }
    return persons;
  })
  .person(function(person, callback) {
    console.log('visited ' + person.$getDisplayName());
  })
  .done(function() {
    console.log('complete');
  })
  .traverse();

/**
 * Returns true of the relationship represents a direct ancestor,
 * direct descendant, or a cousin (descendant of an ancestor).
 *
 * We examine the path data to determine whether a given person
 * is in the scope.
 */
function isAncestorDescendantOrCousin(relationshipData){
  var path = relationshipData.path,
      isAncestor = false,
      isDescendant = false,
      isCousin = false;
  
  // Skip the first person because it's the start person  
  for(var i = 1; i < path.length; i++){
    var relationship = path[i].rel;
    
    if(relationship === 'child'){
      
      // If the previous position in the path was an
      // ancestor (direct mother and father relationships)
      // then we know this person is a cousin.
      if(isAncestor){
        isAncestor = false;
        isCousin = true;
      }
      
      // If the person isn't a cousin then we must be
      // travelling down a direct descendant line
      if(!isCousin){
        isDescendant = true;
      }
    }
        
    else if(relationship === 'mother' || relationship === 'father'){    
      
      // Ignore ancestors of descendants and cousins. We 
      // care about the ancestors of descendants that are 
      // also our descendants but the path to them is more 
      // direct therefore the only people we see here are 
      // those ancestors of the descendant that are out of scope
      if(isDescendant || isCousin){
        return false;
      }
      
      // We are still traveling up the direct ancestral line
      isAncestor = true;
    }
    
    // If we see any other relationship (right now just
    // a spouse) then end. Direct ancestors, descendants,
    // and cousins can be visited through spouse relationships
    // but the most direct paths will never include them
    // therefore we can assume that anyone visited through
    // a spouse relationship is outside of our scope.
    else {
      return false;
    }
  }
  
  // The person is valid if we get here because we
  // short circuit as soon as we know someone is invalid
  return true;
}