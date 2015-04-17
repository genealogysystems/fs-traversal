var filters = module.exports = {};

/**
 * Filter function used by the ancestry traversal
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
 * Filter function used by the descendancy traversal
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
 * Filter function used by the ancestry-descendancy traversal
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
