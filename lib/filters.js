var filters = module.exports = {};

/**
 * Only visit direct ancestors
 */
filters.ancestry = function(personId, relationships){
  var persons = {};
  for(var id in relationships){
    var rel = relationships[id];
    if(isAncestor(rel)){
      persons[id] = rel;
    }
  }
  return persons;
};

/**
 * Only visit direct descendants
 */
filters.descendancy= function(personId, relationships){
  var persons = {};
  for(var id in relationships){
    var rel = relationships[id];
    if(isDescendant(rel)){
      persons[id] = rel;
    }
  }
  return persons;
};

/**
 * Only visit direct ancestors and direct descendants
 */
filters['ancestry-descendancy'] = function(personId, relationships){
  var persons = {};
  for(var id in relationships){
    var rel = relationships[id];
    if(isAncestor(rel) || isDescendant(rel)){
      persons[id] = rel;
    }
  }
  return persons;
};

/**
 * Returns true of the relationship represents a direct ancestor
 */
function isAncestor(relationship){
  return relationship.depth == relationship.distance;
};

/**
 * Returns true if the relationship represents a direct descendant
 */
function isDescendant(relationship){
  return -relationship.depth == relationship.distance
};

/**
 * Only visit cousins, which is ancestors, descendants, and descendants
 * of ancestors. Does not include spouses; not even the spouse of first person.
 */
filters.cousins = function(person, relationships){
  var persons = {};
  for(var id in relationships){
    var rel = relationships[id];
    if(isCousin(rel, false)){
      persons[id] = rel;
    }
  }
  return persons;
};

/**
 * Only visit cousins, which is ancestors, descendants, and descendants
 * of ancestors. Include spouses of these person, but not anybody past spouses.
 */
filters['cousins-spouses'] = function(person, relationships){
  var persons = {};
  for(var id in relationships){
    var rel = relationships[id];
    if(isCousin(rel, true)){
      persons[id] = rel;
    }
  }
  return persons;
};

/**
 * Returns true of the relationship represents a direct ancestor,
 * direct descendant, or a cousin (descendant of an ancestor).
 *
 * We examine the path data to determine whether a given person
 * is in the scope.
 */
function isCousin(relationshipData, includeSpouses){
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
    // If we want to include spouses and we're at the end
    // then this person is valid; otherwise the person is invalid.
    else if(includeSpouses && i === path.length - 1){
      return true;
    } else {
      return false;
    }
  }
  
  // The person is valid if we get here because we
  // short circuit as soon as we know someone is invalid
  return true;
};