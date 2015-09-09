(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FSTraversal = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  code: 'en',
  base: 'yourself',
  join: function(rels){
    return rels.join("'s ");
  },
  patterns: [
    {
      pattern: 'f',
      rel: 'father'
    },
    {
      pattern: 'm',
      rel: 'mother'
    },
    {
      pattern: 's',
      rel: 'son'
    },
    {
      pattern: 'd',
      rel: 'daughter'
    },
    {
      pattern: 'c',
      rel: 'child'
    },
    {
      pattern: 'h',
      rel: 'husband'
    },
    {
      pattern: 'w',
      rel: 'wife'
    },
    {
      pattern: '(m|f)s',
      rel: 'brother'
    },
    {
      pattern: '(m|f)d',
      rel: 'sister'
    },
    {
      pattern: '(m|f)c',
      rel: 'sibling'
    },
    {
      pattern: '(m|f)f',
      rel: 'grandfather'
    },
    {
      pattern: '(m|f)m',
      rel: 'grandmother'
    },
    {
      pattern: '(m|f){2}f',
      rel: 'great-grandfather'
    },
    {
      pattern: '(m|f){2}m',
      rel: 'great-grandmother'
    },
    // nth great grandparent
    {
      pattern: '(m|f){4,}',
      rel: function(str){
        var suffix = str.substr(-1,1) === 'f' ? 'father' : 'mother',
            prefix = '',
            length = str.length;
        if(length == 4) {
          prefix = 'nd';
        } else if(length == 5) {
          prefix = 'rd';
        } else {
          prefix = 'th';
        }
        return (length-2)+prefix+' great-grand'+suffix;
      }
    },
    {
      pattern: '(s|d|c)s',
      rel: 'grandson'
    },
    {
      pattern: '(s|d|c)d',
      rel: 'granddaughter'
    },
    {
      pattern: '(s|d|c)c',
      rel: 'grandchild'
    },
    {
      pattern: '(s|d|c){2}s',
      rel: 'great-grandson'
    },
    {
      pattern: '(s|d|c){2}d',
      rel: 'great-granddaughter'
    },
    {
      pattern: '(s|d|c){2}c',
      rel: 'great-grandchild'
    },
    // nth great grandchild
    {
      pattern: '(s|d|c){4,}',
      rel: function(str){
        var lastChar = str.substr(-1,1),
            suffix = 'child',
            prefix = '',
            length = str.length;
        if(lastChar === 's'){
          suffix = 'son';
        } else if(lastChar === 'd'){
          suffix = 'daughter';
        }
        if(length == 4) {
          prefix = 'nd';
        } else if(length == 5) {
          prefix = 'rd';
        } else {
          prefix = 'th';
        }
        return (length-2)+prefix+' great-grand'+suffix;
      }
    },
    {
      pattern: '(h|w)f',
      rel: 'father-in-law'
    },
    {
      pattern: '(h|w)m',
      rel: 'mother-in-law'
    },
    // Spouse's siblings
    {
      pattern: '(h|w)(m|f)s',
      rel: 'brother-in-law'
    },
    {
      pattern: '(h|w)(m|f)d',
      rel: 'sister-in-law'
    },
    // Sibling's spouses
    {
      pattern: '(m|f)dh',
      rel: 'brother-in-law'
    },
    {
      pattern: '(m|f)sw',
      rel: 'sister-in-law'
    },
    {
      pattern: '(h|w)(m|f)c',
      rel: 'spouse\'s sibling'
    },
    {
      pattern: '(m|f){2}s',
      rel: 'uncle'
    },
    {
      pattern: '(m|f){2}d',
      rel: 'aunt'
    },
    {
      pattern: '(m|f){2}c',
      rel: 'parent\'s sibling'
    },
    {
      pattern: '(m|f){2}(d|s|c){2}',
      rel: 'cousin'
    },
    {
      pattern: '(m|f){3}s',
      rel: 'great-uncle'
    },
    {
      pattern: '(m|f){3}d',
      rel: 'great-aunt'
    },
    {
      pattern: 'dh',
      rel: 'son-in-law'
    },
    {
      pattern: 'sw',
      rel: 'daughter-in-law'
    },
    {
      pattern: '(m|f)(d|s|c)d',
      rel: 'niece'
    },
    {
      pattern: '(m|f)(d|s|c)s',
      rel: 'nephew'
    }
  ]
};
},{}],2:[function(require,module,exports){
module.exports = {
  code: 'es',
  base: 'ego',
  join: function(rels){
    rels.reverse();
    return rels.join(" de ").replace(/de el/g, 'del');
  },
  patterns: [
    {
      pattern: 'f',
      rel: 'el padre'
    },
    {
      pattern: 'm',
      rel: 'la madre'
    },
    {
      pattern: 's',
      rel: 'el hijo'
    },
    {
      pattern: 'd',
      rel: 'la hija'
    },
    {
      pattern: 'c',
      rel: 'el hijo'
    },
    {
      pattern: 'h',
      rel: 'el esposo'
    },
    {
      pattern: 'w',
      rel: 'la esposa'
    },
    {
      pattern: '(m|f)s',
      rel: 'el hermano'
    },
    {
      pattern: '(m|f)d',
      rel: 'la hermana'
    },
    {
      pattern: '(m|f)c',
      rel: 'el hermano'
    },
    // grandparents
    {
      pattern: '(m|f)f',
      rel: 'el abuelo'
    },
    {
      pattern: '(m|f)m',
      rel: 'la abuela'
    },
    {
      pattern: '(m|f){2}f',
      rel: 'el bisabuelo'
    },
    {
      pattern: '(m|f){2}m',
      rel: 'la bisabuela'
    },
    {
      pattern: '(m|f){3}f',
      rel: 'el tatarabuelo'
    },
    {
      pattern: '(m|f){3}m',
      rel: 'la tatarabuela'
    },
    {
      pattern: '(m|f){4}f',
      rel: 'el trastatarabuelo'
    },
    {
      pattern: '(m|f){4}m',
      rel: 'la trastatarabuela'
    },
    // grandchildren
    {
      pattern: '(s|d|c)s',
      rel: 'el nieto'
    },
    {
      pattern: '(s|d|c)d',
      rel: 'la nieta'
    },
    {
      pattern: '(s|d|c)c',
      rel: 'el nieto'
    },
    {
      pattern: '(s|d|c){2}s',
      rel: 'el bisnieto'
    },
    {
      pattern: '(s|d|c){2}d',
      rel: 'la bisnieta'
    },
    {
      pattern: '(s|d|c){2}c',
      rel: 'el bisnieto'
    },
    {
      pattern: '(s|d|c){3}s',
      rel: 'el tataranieto'
    },
    {
      pattern: '(s|d|c){3}d',
      rel: 'la tataranieta'
    },
    {
      pattern: '(s|d|c){3}c',
      rel: 'el tataranieto'
    },
    // In-laws
    {
      pattern: '(h|w)f',
      rel: 'el suegro'
    },
    {
      pattern: '(h|w)m',
      rel: 'la suegra'
    },
    // Spouse's siblings
    {
      pattern: '(h|w)(m|f)s',
      rel: 'el cuñado'
    },
    {
      pattern: '(h|w)(m|f)d',
      rel: 'la cuñada'
    },
    // Sibling's spouses
    {
      pattern: '(m|f)dh',
      rel: 'el cuñado'
    },
    {
      pattern: '(m|f)sw',
      rel: 'la cuñada'
    },
    {
      pattern: '(h|w)(m|f)c',
      rel: 'el cuñado'
    },
    {
      pattern: '(m|f){2}s',
      rel: 'el tío'
    },
    {
      pattern: '(m|f){2}d',
      rel: 'la tía'
    },
    {
      pattern: '(m|f){2}c',
      rel: 'el tío'
    },
    {
      pattern: '(m|f){2}(d|s|c)d',
      rel: 'la prima'
    },
    {
      pattern: '(m|f){2}(d|s|c)s',
      rel: 'el primo'
    },
    {
      pattern: '(m|f){2}(d|s|c)c',
      rel: 'el primo'
    },
    {
      pattern: '(m|f){3}s',
      rel: 'el tío segundo'
    },
    {
      pattern: '(m|f){3}d',
      rel: 'la tía segunda'
    },
    {
      pattern: 'dh',
      rel: 'el yerno'
    },
    {
      pattern: 'sw',
      rel: 'la nuera'
    },
    {
      pattern: '(m|f)(d|s|c)d',
      rel: 'la sobrina'
    },
    {
      pattern: '(m|f)(d|s|c)s',
      rel: 'el sobrino'
    }
  ]
};
},{}],3:[function(require,module,exports){
var utils = require('./utils'),
    each = utils.each;

/**
 * This function does most of the heavy lifting for FSTraversal. It was put
 * into a separate file because it's so long. It is added to the FSTraversal
 * prototype so references to `this` are the current FSTraversal instance.
 */
module.exports = function(person) {
  
  if(this._status === 'stopped'){
    return;
  }
  
  // Handle redirects by aliasing the returned id to the requested id
  if(person.wasRedirected()){
    this._fetched[person.getPrimaryId()] = this._fetched[person.getRequestedId()];
  }
  
  var self = this,
      id = person.getPrimaryId(),
      fetched = this._fetched[id],
      rels = {};

  // Iterate over this person's relationships and create
  // fetched objects for all person's that don't have one yet.
  // If they don't have a fetched object it means this is the
  // first time we've seen them and this is the shortest path
  // to them, therefore we store the path info.
  // But we don't store the objects in the main _fetched map
  // yet because we need to fall the filter functions first.
  
  each(person.getChildIds(), function(childId){
    if(!self._fetched[childId]) {
      rels[childId] = {
        rel: 'child',
        depth: fetched.depth - 1,
        distance: fetched.distance + 1,
        // Use concat to create a copy while appending new data
        path: fetched.path.concat([{rel: 'child', person_id: childId}])
      };
    }
  });
  
  each(person.getFatherIds(), function(fatherId){
    if(!self._fetched[fatherId]) {
      rels[fatherId] = {
        rel: 'father',
        depth: fetched.depth + 1,
        distance: fetched.distance + 1,
        path: fetched.path.concat([{rel: 'father', person_id: fatherId}])
      };
    }
  });
  
  each(person.getMotherIds(), function(motherId){
    if(!self._fetched[motherId]) {
      rels[motherId] = {
        rel: 'mother',
        depth: fetched.depth + 1,
        distance: fetched.distance + 1,
        path: fetched.path.concat([{rel: 'mother', person_id: motherId}])
      };
    }
  });
  
  each(person.getSpouseIds(), function(spouseId){
    if(!self._fetched[spouseId]) {
      rels[spouseId] = {
        rel: 'spouse',
        depth: fetched.depth,
        distance: fetched.distance + 1,
        path: fetched.path.concat([{rel: 'spouse', person_id: spouseId}])
      };
    }
  });

  // Call the filter functions. Pass them a copy of the newly created fetch objects
  // so that we don't have to worry about the data being modified.
  var filtered = [rels];
  each(self._callbacks.filter, function(cb){
    // Pass in a copy of rels
    filtered.push(cb.call(self, person.getPrimaryPerson(), JSON.parse(JSON.stringify(rels))));
  });

  // Add and sort only those ids who were not filtered out;
  // in other words those persons who were returned by _all_ filters.
  var sortedIds = [];
  each(rels, function(rel, x){
    var filteredOut = false;
    each(filtered, function(f, y){
      if(!filtered[y][x]) {
        filteredOut = true;
      }
    });
    if(!filteredOut) {
      rel.weight = self._order(rel);
      sortedIds.push(x);
    }
  });

  // Sort rels 
  sortedIds.sort(function(a,b) {
    return a.weight - b.weight;
  });

  // Queue additional person calls
  each(sortedIds, function(personId){
    // WARNING: Even though we filtered out already fetched people
    // if filter was async we may have processed some in another "thread"
    if(!self._fetched[personId]) {
      if(self._count < self._limit) {
        self._count++;
        self._fetched[personId] = rels[personId];
        self._queue.push(personId, rels[personId].weight);
      }
    }
  });

  // Mark this current person as visited.
  self._visited[id] = person;
  
  // Handle redirects by aliasing the returned id to the requested id
  if(person.wasRedirected()){
    self._visited[person.getRequestedId()] = self._visited[id];
  }
  
  // Call person callbacks
  self._call('person', self._visited[id].getPrimaryPerson());

  var relationshipsCheck = [id];
  
  // Visit Marriages (only when visited all persons)
  var marriages = person.getSpouseRelationships(),
      spouseCheck = [id]; // Always check this person as well as all of their spouses
  each(marriages, function(marriage){
    var husbandId = marriage.getHusbandId(),
        wifeId = marriage.getWifeId();

    if(id == husbandId && wifeId) {
      spouseCheck.push(wifeId);
      relationshipsCheck.push(wifeId);
    }

    if(id == wifeId && husbandId) {
      spouseCheck.push(husbandId);
      relationshipsCheck.push(husbandId);
    }

    if(self._visited[husbandId] && self._visited[wifeId]) {
      self._call('marriage', self._visited[wifeId].getPrimaryPerson(), self._visited[husbandId].getPrimaryPerson(), marriage);
    }
  });

  // For the person and each spouse, see if all of their spouses have been visited.
  // If so, call spouses callback
  spouseCheck = utils.unique(spouseCheck);
  each(spouseCheck, function(fromSpouse) {
    if(self._visited[fromSpouse]) {
      var spouseIds = self._visited[fromSpouse].getSpouseIds(),
          allVisited = true,
          spouses = [];
      each(spouseIds, function(spouseId){
        if(!self._visited[spouseId]) {
          allVisited = false;
        } else {
          spouses.push(self._visited[spouseId].getPrimaryPerson());
        }
      });

      // Call the spouses callback if everyone has been visited
      if(allVisited) {
        self._call('spouses', self._visited[fromSpouse].getPrimaryPerson(), spouses);
      }
    }
  });

  // Visit Child (only when visited all persons)
  // Visit Parent (only when visited all persons)
  var childParents = person.getChildRelationships().concat(person.getParentRelationships()),
      childrenCheck = [id], // Always check this person as well as all of their parents
      parentCheck = [id]; // Always check this person as well as all of their children
  each(childParents, function(childParent){
    
    var childId = childParent.getChildId(),
        motherId = childParent.getMotherId(),
        fatherId = childParent.getFatherId();
    
    // Add each parent to the childrenCheck.
    if(id == childId && motherId) {
      childrenCheck.push(motherId);
      relationshipsCheck.push(motherId);
    }
    if(id == childId && fatherId) {
      childrenCheck.push(fatherId);
      relationshipsCheck.push(fatherId);
    }

    // Add child to parentCheck
    if(childId && (id == motherId || id == fatherId)) {
      parentCheck.push(childId);
      relationshipsCheck.push(childId);
    }

    if(self._visited[childId] 
        && (!motherId || self._visited[motherId])
        && (!fatherId || self._visited[fatherId]) ) {
      
      // Call the child callback
      self._call('child', 
        self._visited[childId].getPrimaryPerson(), 
        (motherId) ? self._visited[motherId].getPrimaryPerson() : undefined, 
        (fatherId) ? self._visited[fatherId].getPrimaryPerson() : undefined, 
        childParent);
    }

    /*
      Call the parent callback with mother if:
         mother exists and has been visited
         and
         (
          father exists and has been visited
          or
          father exists and but hasn't been fetched // we won't be visiting the father if he doesn't have a fetch obj by now
          or
          father does not exist
         )
    */
    if(self._visited[childId] && motherId && self._visited[motherId] &&
      ((fatherId && self._visited[fatherId]) ||
        (fatherId && !self._fetched[fatherId]) ||
        !fatherId)) {
      self._call('parent', self._visited[motherId].getPrimaryPerson(), self._visited[childId].getPrimaryPerson());
    }

    /*
      Call the parent callback with father if:
         father exists and has been visited
         and
         (
          mother exists and has been visited
          or
          mother exists and but hasn't been fetched // we won't be visiting the mother if she doesn't have a fetch obj by now
          or
          mother does not exist
         )
    */
    if(self._visited[childId] && fatherId && self._visited[fatherId] &&
      ((motherId && self._visited[motherId]) ||
        (motherId && !self._fetched[motherId]) ||
        !motherId)) {
      self._call('parent', self._visited[fatherId].getPrimaryPerson(), self._visited[childId].getPrimaryPerson());
    }

  });

  // For the person and each parent, see if all of their children have been visited.
  // If so, call children callback
  childrenCheck = utils.unique(childrenCheck);
  each(childrenCheck, function(parent) {
    if(self._visited[parent]) {
      var childrenIds = self._visited[parent].getChildIds(),
          allVisited = true,
          children = [];
      each(childrenIds, function(childId){
        if(!self._visited[childId]) {
          allVisited = false;
        } else {
          children.push(self._visited[childId].getPrimaryPerson());
        }
      });

      // Call the children callback if everyone has been visited
      if(allVisited) {
        self._call('children', self._visited[parent].getPrimaryPerson(), children);
      }
    }
  });

  // For the person and each child, see if all of their parents have been visited.
  // If so, call parents callback
  parentCheck = utils.unique(parentCheck);
  each(parentCheck, function(child) {
    if(self._visited[child]) {
      var parentIds = utils.unique(self._visited[child].getFatherIds().concat(self._visited[child].getMotherIds())),
          allVisited = true,
          parents = [];
      each(parentIds, function(parentId){
        if(!self._visited[parentId]) {
          allVisited = false;
        } else {
          parents.push(self._visited[parentId].getPrimaryPerson());
        }
      });
      // Call the parents callback if everyone has been visited
      if(allVisited) {
        self._call('parents', self._visited[child].getPrimaryPerson(), parents);
      }
    }
  });

  // For the person and each person related, check to see if every relationship has been visited.
  // If so, call relationships callback
  relationshipsCheck = utils.unique(relationshipsCheck);
  each(relationshipsCheck, function(relation) {
    if(self._visited[relation]) {
      var allVisited = true,
          related = {};
      
      // Check the persons parents
      var parentIds = utils.unique(self._visited[relation].getFatherIds().concat(self._visited[relation].getMotherIds()));
      each(parentIds, function(parentId){
        if(!self._visited[parentId]) {
          allVisited = false;
        } else {
          related[parentId] = self._visited[parentId].getPrimaryPerson();
        }
      });

      // Check the persons children
      var childrenIds = self._visited[relation].getChildIds();
      each(childrenIds, function(childId){
        if(!self._visited[childId]) {
          allVisited = false;
        } else {
          related[childId] = self._visited[childId].getPrimaryPerson();
        }
      });

      // Check the persons spouses
      var spouseIds = self._visited[relation].getSpouseIds();
      each(spouseIds, function(spouseId){
        if(!self._visited[spouseId]) {
          allVisited = false;
        } else {
          related[spouseId] = self._visited[spouseId].getPrimaryPerson();
        }
      });

      // Call the relationships callback if everyone has been visited
      if(allVisited) {
        self._call('relationships', self._visited[relation].getPrimaryPerson(), self._visited[relation], related);
      }
    }
  });
  
  // Piece together all of the families which this person belongs to. We must
  // also examine the child relationships of all parents so that we include
  // all siblings. But we must filter out any resulting families of the
  // parents to which the child does not belong.


  // This object will be keyed by {wifeId:husbandId}.
  var families = {};
  
  // Process all relationships for this person
  var childAndParentsList = person.getChildRelationships()
    .concat(person.getParentRelationships());
  
  // For all parents, process all child relationship
  var parentIds = person.getMotherIds().concat(person.getFatherIds());
  each(parentIds, function(parentId){
    if(self._visited[parentId]){
      childAndParentsList = childAndParentsList.concat(self._visited[parentId].getChildRelationships());
    }
  });
    
  // Build the families
  each(childAndParentsList, function(childParents){
    var familyId = childParents.getMotherId() + ':' + childParents.getFatherId();
    
    // Setup the family if we haven't seen it yet
    if(!families[familyId]){
      families[familyId] = {
        wifeId: childParents.getMotherId(),
        husbandId: childParents.getFatherId(),
        childrenIds: []
      };
    }
    
    // Add the child
    families[familyId].childrenIds.push(childParents.getChildId());
  });

  // For each resulting family:
  // 1: make sure this person is in the family (filter out families of
  //    parents that this child does not belong to)
  // 2: check whether all persons have been visited
  each(families, function(family){
    var allVisited = true,
        wife = self._visited[family.wifeId],
        husband = self._visited[family.husbandId],
        children = [];
    
    if(family.wifeId !== id && family.husbandId !== id && 
        family.childrenIds.indexOf(id) === -1) {
      return false;
    }
        
    if(family.wifeId) {
      if(!wife) {
        allVisited = false;
      } else {
        wife = wife.getPrimaryPerson();
      }
    }
    
    if(family.husbandId) {
      if(!husband){
        allVisited = false;
      } else {
        husband = husband.getPrimaryPerson();
      }
    }
    
    each(utils.unique(family.childrenIds), function(childId){
      if(!self._visited[childId]){
        allVisited = false;
      } else {
        children.push(self._visited[childId].getPrimaryPerson());
      }
    });
    
    if(allVisited){
      self._call('family', wife, husband, children);
    }
  });
};
},{"./utils":8}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
var orders = require('./orders'),
    filters = require('./filters'),
    switchString = require('./switchString'),
    async = require('async'),
    utils = require('./utils'),
    each = utils.each;

var FSTraversal = module.exports = function(sdk) {
  
  // Allow the constructor to be called without the new keyword
  // Maintains backwards compatibility
  if(!(this instanceof FSTraversal)){
    return new FSTraversal(sdk);
  }
  
  if(!sdk){
    throw new Error('FamilySearch SDK is not defined');
  }
    
  /**
   * The already initialized FamilySearch SDK
   * https://github.com/rootsdev/familysearch-javascript-sdk
   */
  this._sdk = sdk;

  /**
   * The status of the traversal.
   * Possible values are ready, running, paused, done.
   */
  this._status = 'ready';

  /**
   * The object of persons we've visited, keyed by id.
   * Note that the value is the person-with-relationships object returned by the sdk.
   */
  this._visited = {};

  /**
   * The object of person id's we've fetched so far.
   * Note that we place these in here before calling the API.
   * It is possible that the API call failed, in which case we
   * do NOT clean these out. Use visited to see of a node has
   * been visited successfully.
   */
  this._fetched = {};

  /**
   * The total number of people we've fetched.
   * Defaults to 1 because we always fetch the root person.
   */
  this._count = 1;
  
  /**
   * Order is a function that calculates weights and thereby determines
   * the order of traversal. Lower weights are higher priority.
   */
  this._order = orders['distance'];
  
  /**
   * How many people we should visit during the traversal
   */
  this._limit = Infinity;
  
  /**
   * Concurrency for the queue
   */
  this._concurrency = 5;
  
  /**
   * Use an async priority queue to manage concurrency
   * of outstanding FS API requests
   */
  this._queue = null;
  
  /**
   * All of our registered callbacks.
   */
  this._callbacks = {
    filter: [],
    person: [],
    child: [],
    children: [],
    parent: [],
    parents: [],
    marriage: [],
    spouses: [],
    family: [],
    relationships: [],
    error: [],
    done: []
  };
  
};

/**
 * Object to store language configs
 */
FSTraversal._langs = {};

/**
 * Expose functions to change options
 */
FSTraversal.prototype.order = function(order) {
  
  // Make sure we haven't or are not currently traversing.
  if(this._status !== 'ready') {
    throw new Error('You may only set the order before starting a traversal');
  }
  
  // If order is a string, lookup the matching built-in order function
  if(utils.isString(order)){
    if(orders[order]){
      this._order = orders[order];
    } else {
      throw new Error(order + ' is not a valid built-in order.');
    }
  }
  
  // If order is a function...
  else if(utils.isFunction(order)){
    this._order = order;
  }
  
  else {
    throw new Error('Order must be a string or a function');
  }
  
  // If additional params were passed, wrap them so that they're
  // passed to the order function
  if(arguments.length > 1){
    var additionalArgs = Array.prototype.slice.call(arguments, 1),
        originalOrder = this._order;
    this._order = function(fetchObj){
      return originalOrder.apply(this, [fetchObj].concat(additionalArgs));
    }
  }

  return this;
};

/**
 * Register filters. Allow for built-in by passing a string
 * or custom by passing in a function, similar to order.
 * Multiple filters can be registered.
 */
FSTraversal.prototype.filter = function(filter) {
  
  // If filter is a string, lookup the matching built-in filter function
  if(utils.isString(filter)){
    if(filters[filter]){
      filter = filters[filter];
    } else {
      throw new Error(filter + ' is not a valid built-in filter.');
    }
  }
  
  else if(!utils.isFunction(filter)){
    throw new Error('Order must be a string or a function');
  }
  
  this._registerCallback('filter', filter);
  
  return this;
};

/**
 * Set a limit on the number of people to visit
 */
FSTraversal.prototype.limit = function(num) {
  if(typeof num !== 'number') {
    throw new Error('invalid limit');
  }
  this._limit = num;

  return this;
};

/**
 * Set the concurrency of the queue
 */
FSTraversal.prototype.concurrency = function(num) {
  if(typeof num !== 'number') {
    throw new Error('invalid concurrency');
  }
  if(this._queue){
    this._queue.concurrency = num;
    this._concurrency = num;
  } else {
    this._concurrency = num;
  }

  return this;
};

/**
 * Pause the traversal
 */
FSTraversal.prototype.pause = function(){
  if(this._status === 'running'){
    this._queue.pause();
    this._status = 'paused';
  }
};

/**
 * Resume a paused traversal
 */
FSTraversal.prototype.resume = function(){
  if(this._status === 'paused'){
    this._queue.resume();
    this._status = 'running';
  }
};

/**
 * End traversal immediately
 */
FSTraversal.prototype.stop = function(){
  if(this._status === 'running' || this._status === 'paused'){
    this._status = 'stopped';
    this._queue.kill();
  }
};

/**
 * Register callbacks
 */ 
FSTraversal.prototype.person = function(func) {this._registerCallback('person', func); return this;};
FSTraversal.prototype.child = function(func) {this._registerCallback('child', func); return this;};
FSTraversal.prototype.children = function(func) {this._registerCallback('children', func); return this;};
FSTraversal.prototype.parent = function(func) {this._registerCallback('parent', func); return this;};
FSTraversal.prototype.parents = function(func) {this._registerCallback('parents', func); return this;};
FSTraversal.prototype.marriage = function(func) {this._registerCallback('marriage', func); return this;};
FSTraversal.prototype.spouses = function(func) {this._registerCallback('spouses', func); return this;};
FSTraversal.prototype.family = function(func) {this._registerCallback('family', func); return this;};
FSTraversal.prototype.relationships = function(func) {this._registerCallback('relationships', func); return this;};
FSTraversal.prototype.done = function(func) {this._registerCallback('done', func); return this;};
FSTraversal.prototype.error = function(func) {this._registerCallback('error', func); return this;};

FSTraversal.prototype._registerCallback = function(type, func) {
  if(typeof func !== 'function') {
    throw new Error(type+' must register a function');
  }
  if(this._callbacks[type] == undefined) {
    throw new Error('Unknown type '+ type);
  }
  this._callbacks[type].push(func);
};

FSTraversal.prototype.status = function() {
  return this._status;
};

FSTraversal.prototype._isStopped = function() {
  return this._status === 'stopped';
};

/**
 * Begin the traversal.
 */
FSTraversal.prototype.start = function() {
  var self = this;

  if(arguments.length == 1) {
    self._traverse(arguments[0]);
  } else {
    self._sdk.getCurrentUser().then(function(response){
      self._traverse(response.getUser().getPersonId());
    }, function(error){
      self._call('error', null, error);
    });
  }
  
  return self;
};

// Alias `traverse` to `start` for backwards compatibility
FSTraversal.prototype.traverse = FSTraversal.prototype.start;

/**
 * Internal traversal function
 */
FSTraversal.prototype._traverse = function(startId) {
  var self = this;

  // Make sure a start point was given
  if(typeof startId === 'undefined'){
    throw new Error('Must specify a starting person id');
  }
  
  // Make sure we haven't or are not currently traversing.
  if(self._status !== 'ready') {
    throw new Error('You may only start a traversal when status is ready');
  }

  self._status = 'running';

  var fetchStart = self._fetched[startId] = {
    type: 'root',
    depth: 0,
    distance: 0,
    weight: 0,
    path: [{
      rel: 'start',
      person_id: startId
    }]
  };
  
  fetchStart.weight = self._order(fetchStart);
  
  /**
   * Setup the queue
   */
  
  self._queue = async.priorityQueue(function(personId, callback){
    self._sdk.getPersonWithRelationships(personId).then(function(response) {
      self._processPerson(response);
      // Callback is after _processPerson so that the queue.drain function
      // will get called at the proper time.
      // TODO: move to before _processPerson and find better way of tracking "the end" of traversal
      callback();
    }, function(error){
      self._call('error', personId, error);
    });
  }, self._concurrency);
  
  self._queue.push(startId);
  
  // Fire done callbacks when the queue drains
  self._queue.drain = function(){
    self._status = 'done';
    self._call('done');
  };
  
  return self;
};

// This was put into a separate file because it's so big
FSTraversal.prototype._processPerson = require('./_processPerson');

/**
 * Takes in a visited person id and returns the path array of format:
 * [{rel: 'relationship', person: personObject}, ... ]
 */
FSTraversal.prototype.pathTo = function(id){
  if(!this._fetched[id] || !this._visited[id]){
    return [];
  }
  
  var fetchPath = this._fetched[id].path,
      returnPath = [];
  
  for(var i = 0; i < fetchPath.length; i++){
    returnPath.push({
      rel: fetchPath[i].rel,
      person: this._visited[fetchPath[i].person_id].getPrimaryPerson()
    });
  }
  
  return returnPath;
};

/**
 * Returns the weight of a person. Only works for persons that have been fetched.
 */
FSTraversal.prototype.weight = function(personId){
  if(this._fetched[personId]){
    return this._fetched[personId].weight;
  }
};

/**
 * Takes in a visited id and produces a string representing the relationship to the root node.
 */
FSTraversal.prototype.relationshipTo = function(id, lang) {
  if(!this._fetched[id]) {
    return '';
  }

  var path = this.pathTo(id);

  return this._relationshipTo(path, lang);
};

/**
 * Internal function that takes in a path and returns a human-readable string.
 * The relationship is calculated by first generating a coded string that
 * represents the path, then examining the string in chunks of decreasing size
 * to find the most relevant or shortest way to describe the relationship.
 */
FSTraversal.prototype._relationshipTo = function(path, lang) {

  if(!lang){
    throw new Error('Language code is required.');
  }

  var relations = [],
      remainder = '',
      done = false,
      relConfig = FSTraversal._langs[lang];
      
  if(!relConfig){
    throw new Error('Language ' + lang + ' has not been registered.');
  }
  
  // Short circuit on base-person special case
  if(path.length === 1){
    return relConfig.base;
  }
  
  var switchStr = switchString(path);
  
  while(!done) {
    
    var rel = '';

    // Find a match for the current portion of the string, if we can
    for(var i = 0; i < relConfig.patterns.length; i++){
      var c = relConfig.patterns[i];
      if(c.regex.test(switchStr)){
        if(utils.isString(c.rel)){
          rel = c.rel;
        }
        else if(utils.isFunction(c.rel)){
          rel = c.rel(switchStr);
        }
        break;
      }
    }

    // If we found a match, update the relationship string
    // and prepare to examine the remaining portion
    if(rel) {
      relations.push(rel);
      if(remainder) {
        switchStr = remainder;
        remainder = '';
      } else {
        done = true;
      }
    } 
    
    // If we didn't find a match, prepare to examine a
    // smaller portion of the switch string
    else {
    
      // Lengthen the remainder and shorten the switch string
      remainder = switchStr.substr(-1,1)+remainder;
      switchStr = switchStr.substr(0,switchStr.length-1);
    }

  }

  return relConfig.join(relations);
};

/**
 * Register a new language.
 */
FSTraversal.lang = function(config){
  if(!config.code){
    throw new Error('Missing language code');
  }
  FSTraversal._langs[config.code] = config;
  
  // Create regex objects for relConfig. This is done
  // so that we don't need to generate correct regex
  // objects in the patterns with leading ^ and
  // trailing $. This wouldn't be useful if we allowed
  // regex to only examine portions of a rel string
  // but we don't allow that.
  each(config.patterns, function(c){
    c.regex = new RegExp('^' + c.pattern + '$');
  });
};

FSTraversal.lang(require('../lang/en.js'));
FSTraversal.lang(require('../lang/es.js'));

/**
 * Helper function to fire all callbacks of a given category
 * with the specified arguments.
 */
FSTraversal.prototype._call = function(category, params){
  var self = this, args = [];

  // Allow args to be an array or individual parameters
  if(!utils.isArray(params) || arguments.length > 2){
    args = [];
    for(var i = 1; i < arguments.length; i++){
      args.push(arguments[i]);
    }
  } else if(utils.isArray(params)) {
    args = params;
  } else {
    args = [params];
  }

  each(self._callbacks[category], function(cb){
    setTimeout(function() {
      if(self._isStopped()){
        return;
      }
      cb.apply(self, args);
    });
  });
};
},{"../lang/en.js":1,"../lang/es.js":2,"./_processPerson":3,"./filters":4,"./orders":6,"./switchString":7,"./utils":8,"async":9}],6:[function(require,module,exports){
var utils = require('./utils');

var orders = module.exports = {};

orders.distance = function(fetchObj){
  return fetchObj.distance;
};

/**
 * Calculate the weight for a wrd traversal
 * Based on http://fht.byu.edu/prev_workshops/workshop13/papers/baker-beyond-fhtw2013.pdf
 */
orders.wrd = function(fetchObj, wrdFactors){
  
  if(!wrdFactors){
    wrdFactors = {
      gPositive: 1,
      gNegative: 1,
      c: 1,
      m: 1
    };
  }
  
  var wrd = {
    g: 0,
    c: 0,
    m: 0,
    up: false
  };
  
  utils.each(fetchObj.path, function(rel){
    switch(rel.rel) {
      case 'child':
        wrd.g -= 1;
        wrd.c = wrd.up ? wrd.c + 1 : wrd.c;
        break;
      case 'father':
      case 'mother':
        wrd.g += 1;
        wrd.c = wrd.c == 0 ? 0 : wrd.c + 1;
        wrd.up = true;
        break;
      case 'spouse':
        wrd.m += 1;
        break;
    }
  });

  var G = ((wrd.g >= 0) ? wrdFactors.gPositive : wrdFactors.gNegative) * (Math.abs(wrd.g) + 1),
      C = Math.pow(Math.E, wrdFactors.c * wrd.c),
      M = Math.pow(Math.E, wrdFactors.m * wrd.m);
  return G*C*M
};

/**
 * Inspired by WRD, developed by FAR to fix the problem with collateral lines
 */
orders['wrd-far'] = function(fetchObj){
  
  // Short circuit on all relationships of distance one
  // Helps us deal with siblings in a better way
  if(fetchObj.distance === 1){
    return 1;
  }
  
  var path = fetchObj.path,
      d = fetchObj.distance,
      s = 0, // Number of sibling relationships
      c = 0, // Number of collateral line changes
      dc = 0; // Distance travelled since entering first collateral line
      
  for(var i = 1; i < fetchObj.path.length; i++){
    if(c){
      dc++;
    }
    if(path[i].rel === 'spouse'){
      c++;
    }
    else {
      var currentChild = _isChildRel(path[i].rel),
          currentParent = _isParentRel(path[i].rel),
          prevChild = _isChildRel(path[i-1].rel),
          prevParent = _isParentRel(path[i-1].rel);
      if((currentChild && prevParent) || (currentParent && prevChild)){
        c++;
        s += .5;
      }
    }
  }
  
  var w = (d - s) * Math.pow(Math.E, c * 1.4) * Math.pow(Math.E, (dc - s) * 1.5);
  
  return w;
};
function _isParentRel(rel){
  return rel === 'mother' || rel === 'father';
};
function _isChildRel(rel){
  return rel === 'child';
};
},{"./utils":8}],7:[function(require,module,exports){
/**
 * Generate a coded string representing the relationship path
 */
module.exports = function(path){
  var switchStr = '';
  for(var i = 1; i < path.length; i++) {
    switch(path[i].rel) {
      case 'child':
        switch(path[i].person.gender.type){
          case 'http://gedcomx.org/Male':
            switchStr += 's';
            break;
          case 'http://gedcomx.org/Female':
            switchStr += 'd';
            break;
          default:
            switchStr += 'c';
            break;
        }
        break;
      case 'mother':
        switchStr += 'm';
        break;
      case 'father':
        switchStr += 'f';
        break;
      case 'spouse':
        switch(path[i].person.gender.type){
          case 'http://gedcomx.org/Male':
            switchStr += 'h';
            break;
          case 'http://gedcomx.org/Female':
            switchStr += 'w';
            break;
          default:
            return '';
        }
        break;
      default:
        return '';
    }
  }
  return switchStr;
};
},{}],8:[function(require,module,exports){
var utils = module.exports;

/**
 * Lifted from underscore.js
 * http://underscorejs.org/docs/underscore.html#section-15
 */
utils.each = function(obj, iterator, context) {
  if (obj == null) return obj;
  if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, length = obj.length; i < length; i++) {
      iterator.call(context, obj[i], i, obj);
    }
  } else {
    var keys = utils.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      iterator.call(context, obj[keys[i]], keys[i], obj);
    }
  }
  return obj;
};

utils.keys = function(obj) {
  if (!obj === Object(obj)) return [];
  if (Object.keys) return Object.keys(obj);
  var keys = [];
  for (var key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
  return keys;
};

utils.unique = function(array) {
  var results = [];

  utils.each(array, function(val){
    if(results.indexOf(val) == -1) {
      results.push(val);
    }
  });
  return results;
};

utils.isString = function(obj){
  return Object.prototype.toString.call(obj) === '[object String]';
};

utils.isFunction = function(obj){
  return Object.prototype.toString.call(obj) === '[object Function]' || typeof obj === 'function';
};

utils.isArray = function(obj){
  return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
};
},{}],9:[function(require,module,exports){
(function (process,global){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
(function () {

    var async = {};
    function noop() {}

    // global on the server, window in the browser
    var root, previous_async;

    if (typeof window == 'object' && this === window) {
        root = window;
    }
    else if (typeof global == 'object' && this === global) {
        root = global;
    }
    else {
        root = this;
    }

    if (root != null) {
      previous_async = root.async;
    }

    async.noConflict = function () {
        root.async = previous_async;
        return async;
    };

    function only_once(fn) {
        var called = false;
        return function() {
            if (called) throw new Error("Callback was already called.");
            called = true;
            fn.apply(this, arguments);
        };
    }

    function _once(fn) {
        var called = false;
        return function() {
            if (called) return;
            called = true;
            fn.apply(this, arguments);
        };
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    function _isArrayLike(arr) {
        return _isArray(arr) || (
            // has a positive integer length property
            typeof arr.length === "number" &&
            arr.length >= 0 &&
            arr.length % 1 === 0
        );
    }

    function _each(coll, iterator) {
        return _isArrayLike(coll) ?
            _arrayEach(coll, iterator) :
            _forEachOf(coll, iterator);
    }

    function _arrayEach(arr, iterator) {
      var index = -1,
          length = arr.length;

      while (++index < length) {
        iterator(arr[index], index, arr);
      }
    }

    function _map(arr, iterator) {
      var index = -1,
          length = arr.length,
          result = Array(length);

      while (++index < length) {
        result[index] = iterator(arr[index], index, arr);
      }
      return result;
    }

    function _range(count) {
        return _map(Array(count), function (v, i) { return i; });
    }

    function _reduce(arr, iterator, memo) {
        _arrayEach(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    }

    function _forEachOf(object, iterator) {
        _arrayEach(_keys(object), function (key) {
            iterator(object[key], key);
        });
    }

    var _keys = Object.keys || function (obj) {
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    function _keyIterator(coll) {
        var i = -1;
        var len;
        var keys;
        if (_isArrayLike(coll)) {
            len = coll.length;
            return function next() {
                i++;
                return i < len ? i : null;
            };
        } else {
            keys = _keys(coll);
            len = keys.length;
            return function next() {
                i++;
                return i < len ? keys[i] : null;
            };
        }
    }

    function _baseSlice(arr, start) {
        start = start || 0;
        var index = -1;
        var length = arr.length;

        if (start) {
          length -= start;
          length = length < 0 ? 0 : length;
        }
        var result = Array(length);

        while (++index < length) {
          result[index] = arr[index + start];
        }
        return result;
    }

    function _withoutIndex(iterator) {
        return function (value, index, callback) {
            return iterator(value, callback);
        };
    }

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////

    // capture the global reference to guard against fakeTimer mocks
    var _setImmediate;
    if (typeof setImmediate === 'function') {
        _setImmediate = setImmediate;
    }

    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (_setImmediate) {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                _setImmediate(fn);
            };
            async.setImmediate = async.nextTick;
        }
        else {
            async.nextTick = function (fn) {
                setTimeout(fn, 0);
            };
            async.setImmediate = async.nextTick;
        }
    }
    else {
        async.nextTick = process.nextTick;
        if (_setImmediate) {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              _setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.forEach =
    async.each = function (arr, iterator, callback) {
        return async.eachOf(arr, _withoutIndex(iterator), callback);
    };

    async.forEachSeries =
    async.eachSeries = function (arr, iterator, callback) {
        return async.eachOfSeries(arr, _withoutIndex(iterator), callback);
    };


    async.forEachLimit =
    async.eachLimit = function (arr, limit, iterator, callback) {
        return _eachOfLimit(limit)(arr, _withoutIndex(iterator), callback);
    };

    async.forEachOf =
    async.eachOf = function (object, iterator, callback) {
        callback = _once(callback || noop);
        object = object || [];
        var size = _isArrayLike(object) ? object.length : _keys(object).length;
        var completed = 0;
        if (!size) {
            return callback(null);
        }
        _each(object, function (value, key) {
            iterator(object[key], key, only_once(done));
        });
        function done(err) {
          if (err) {
              callback(err);
          }
          else {
              completed += 1;
              if (completed >= size) {
                  callback(null);
              }
          }
        }
    };

    async.forEachOfSeries =
    async.eachOfSeries = function (obj, iterator, callback) {
        callback = _once(callback || noop);
        obj = obj || [];
        var nextKey = _keyIterator(obj);
        function iterate() {
            var sync = true;
            var key = nextKey();
            if (key === null) {
                return callback(null);
            }
            iterator(obj[key], key, function (err) {
                if (err) {
                    callback(err);
                }
                else {
                    if (sync) {
                        async.nextTick(iterate);
                    }
                    else {
                        iterate();
                    }
                }
            });
            sync = false;
        }
        iterate();
    };



    async.forEachOfLimit =
    async.eachOfLimit = function (obj, limit, iterator, callback) {
        _eachOfLimit(limit)(obj, iterator, callback);
    };

    function _eachOfLimit(limit) {

        return function (obj, iterator, callback) {
            callback = _once(callback || noop);
            obj = obj || [];
            var nextKey = _keyIterator(obj);
            if (limit <= 0) {
                return callback(null);
            }
            var done = false;
            var running = 0;
            var errored = false;

            (function replenish () {
                if (done && running <= 0) {
                    return callback(null);
                }

                while (running < limit && !errored) {
                    var key = nextKey();
                    if (key === null) {
                        done = true;
                        if (running <= 0) {
                            callback(null);
                        }
                        return;
                    }
                    running += 1;
                    iterator(obj[key], key, function (err) {
                        running -= 1;
                        if (err) {
                            callback(err);
                            errored = true;
                        }
                        else {
                            replenish();
                        }
                    });
                }
            })();
        };
    }


    function doParallel(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOf, obj, iterator, callback);
        };
    }
    function doParallelLimit(limit, fn) {
        return function (obj, iterator, callback) {
            return fn(_eachOfLimit(limit), obj, iterator, callback);
        };
    }
    function doSeries(fn) {
        return function (obj, iterator, callback) {
            return fn(async.eachOfSeries, obj, iterator, callback);
        };
    }

    function _asyncMap(eachfn, arr, iterator, callback) {
        callback = _once(callback || noop);
        var results = [];
        eachfn(arr, function (value, index, callback) {
            iterator(value, function (err, v) {
                results[index] = v;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    function _mapLimit(limit) {
        return doParallelLimit(limit, _asyncMap);
    }

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.inject =
    async.foldl =
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachOfSeries(arr, function (x, i, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err || null, memo);
        });
    };

    async.foldr =
    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };

    function _filter(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, index, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }

    async.select =
    async.filter = doParallel(_filter);

    async.selectSeries =
    async.filterSeries = doSeries(_filter);

    function _reject(eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, index, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function () {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    }
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    function _detect(eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, index, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = noop;
                }
                else {
                    callback();
                }
            });
        }, function () {
            main_callback();
        });
    }
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.any =
    async.some = function (arr, iterator, main_callback) {
        async.eachOf(arr, function (x, _, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = noop;
                }
                callback();
            });
        }, function () {
            main_callback(false);
        });
    };

    async.all =
    async.every = function (arr, iterator, main_callback) {
        async.eachOf(arr, function (x, _, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = noop;
                }
                callback();
            });
        }, function () {
            main_callback(true);
        });
    };

    async.sortBy = function (arr, iterator, callback) {
        async.map(arr, function (x, callback) {
            iterator(x, function (err, criteria) {
                if (err) {
                    callback(err);
                }
                else {
                    callback(null, {value: x, criteria: criteria});
                }
            });
        }, function (err, results) {
            if (err) {
                return callback(err);
            }
            else {
                callback(null, _map(results.sort(comparator), function (x) {
                    return x.value;
                }));
            }

        });

        function comparator(left, right) {
            var a = left.criteria, b = right.criteria;
            return a < b ? -1 : a > b ? 1 : 0;
        }
    };

    async.auto = function (tasks, callback) {
        callback = _once(callback || noop);
        var keys = _keys(tasks);
        var remainingTasks = keys.length;
        if (!remainingTasks) {
            return callback(null);
        }

        var results = {};

        var listeners = [];
        function addListener(fn) {
            listeners.unshift(fn);
        }
        function removeListener(fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        }
        function taskComplete() {
            remainingTasks--;
            _arrayEach(listeners.slice(0), function (fn) {
                fn();
            });
        }

        addListener(function () {
            if (!remainingTasks) {
                callback(null, results);
            }
        });

        _arrayEach(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            function taskCallback(err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _arrayEach(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            }
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            // prevent dead-locks
            var len = requires.length;
            var dep;
            while (len--) {
                if (!(dep = tasks[requires[len]])) {
                    throw new Error('Has inexistant dependency');
                }
                if (_isArray(dep) && !!~dep.indexOf(k)) {
                    throw new Error('Has cyclic dependencies');
                }
            }
            function ready() {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            }
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                addListener(listener);
            }
            function listener() {
                if (ready()) {
                    removeListener(listener);
                    task[task.length - 1](taskCallback, results);
                }
            }
        });
    };

    async.retry = function(times, task, callback) {
        var DEFAULT_TIMES = 5;
        var attempts = [];
        // Use defaults if times not passed
        if (typeof times === 'function') {
            callback = task;
            task = times;
            times = DEFAULT_TIMES;
        }
        // Make sure times is a number
        times = parseInt(times, 10) || DEFAULT_TIMES;

        function wrappedTask(wrappedCallback, wrappedResults) {
            function retryAttempt(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            }

            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }

        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask;
    };

    async.waterfall = function (tasks, callback) {
        callback = _once(callback || noop);
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        function wrapIterator(iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                }
                else {
                    var args = _baseSlice(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    ensureAsync(iterator).apply(null, args);
                }
            };
        }
        wrapIterator(async.iterator(tasks))();
    };

    function _parallel(eachfn, tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        eachfn(tasks, function (task, key, callback) {
            task(function (err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    }

    async.parallel = function (tasks, callback) {
        _parallel(async.eachOf, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel(_eachOfLimit(limit), tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || noop;
        var results = _isArrayLike(tasks) ? [] : {};

        async.eachOfSeries(tasks, function (task, key, callback) {
            task(function (err) {
                var args = _baseSlice(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[key] = args;
                callback(err);
            });
        }, function (err) {
            callback(err, results);
        });
    };

    async.iterator = function (tasks) {
        function makeCallback(index) {
            function fn() {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            }
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        }
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = _baseSlice(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(_baseSlice(arguments))
            );
        };
    };

    function _concat(eachfn, arr, fn, callback) {
        var result = [];
        eachfn(arr, function (x, index, cb) {
            fn(x, function (err, y) {
                result = result.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, result);
        });
    }
    async.concat = doParallel(_concat);
    async.concatSeries = doSeries(_concat);

    async.whilst = function (test, iterator, callback) {
        if (test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.whilst(test, iterator, callback);
            });
        }
        else {
            callback(null);
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback(null);
            }
        });
    };

    async.until = function (test, iterator, callback) {
        if (!test()) {
            iterator(function (err) {
                if (err) {
                    return callback(err);
                }
                async.until(test, iterator, callback);
            });
        }
        else {
            callback(null);
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = _baseSlice(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback(null);
            }
        });
    };

    function _queue(worker, concurrency, payload) {
        if (concurrency == null) {
            concurrency = 1;
        }
        else if(concurrency === 0) {
            throw new Error('Concurrency must not be zero');
        }
        function _insert(q, data, pos, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0 && q.idle()) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                   q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    callback: callback || noop
                };

                if (pos) {
                  q.tasks.unshift(item);
                } else {
                  q.tasks.push(item);
                }

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
            });
            async.setImmediate(q.process);
        }
        function _next(q, tasks) {
            return function(){
                workers -= 1;
                var args = arguments;
                _arrayEach(tasks, function (task) {
                    task.callback.apply(task, args);
                });
                if (q.tasks.length + workers === 0) {
                    q.drain();
                }
                q.process();
            };
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: noop,
            empty: noop,
            drain: noop,
            started: false,
            paused: false,
            push: function (data, callback) {
                _insert(q, data, false, callback);
            },
            kill: function () {
                q.drain = noop;
                q.tasks = [];
            },
            unshift: function (data, callback) {
                _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    while(workers < q.concurrency && q.tasks.length){
                        var tasks = payload ?
                            q.tasks.splice(0, payload) :
                            q.tasks.splice(0, q.tasks.length);
    
                        var data = _map(tasks, function (task) {
                            return task.data;
                        });
    
                        if (q.tasks.length === 0) {
                            q.empty();
                        }
                        workers += 1;
                        var cb = only_once(_next(q, tasks));
                        worker(data, cb);
                    }
                }
            },
            length: function () {
                return q.tasks.length;
            },
            running: function () {
                return workers;
            },
            idle: function() {
                return q.tasks.length + workers === 0;
            },
            pause: function () {
                q.paused = true;
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                var resumeCount = Math.min(q.concurrency, q.tasks.length);
                // Need to call q.process once per concurrent
                // worker to preserve full concurrency after pause
                for (var w = 1; w <= resumeCount; w++) {
                    async.setImmediate(q.process);
                }
            }
        };
        return q;
    }

    async.queue = function (worker, concurrency) {
        var q = _queue(function (items, cb) {
            worker(items[0], cb);
        }, concurrency, 1);

        return q;
    };

    async.priorityQueue = function (worker, concurrency) {

        function _compareTasks(a, b){
            return a.priority - b.priority;
        }

        function _binarySearch(sequence, item, compare) {
          var beg = -1,
              end = sequence.length - 1;
          while (beg < end) {
              var mid = beg + ((end - beg + 1) >>> 1);
              if (compare(item, sequence[mid]) >= 0) {
                  beg = mid;
              } else {
                  end = mid - 1;
              }
          }
          return beg;
        }

        function _insert(q, data, priority, callback) {
            if (callback != null && typeof callback !== "function") {
                throw new Error("task callback must be a function");
            }
            q.started = true;
            if (!_isArray(data)) {
                data = [data];
            }
            if(data.length === 0) {
                // call drain immediately if there are no tasks
                return async.setImmediate(function() {
                    q.drain();
                });
            }
            _arrayEach(data, function(task) {
                var item = {
                    data: task,
                    priority: priority,
                    callback: typeof callback === 'function' ? callback : noop
                };

                q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

                if (q.tasks.length === q.concurrency) {
                    q.saturated();
                }
                async.setImmediate(q.process);
            });
        }

        // Start with a normal queue
        var q = async.queue(worker, concurrency);

        // Override push to accept second parameter representing priority
        q.push = function (data, priority, callback) {
            _insert(q, data, priority, callback);
        };

        // Remove unshift function
        delete q.unshift;

        return q;
    };

    async.cargo = function (worker, payload) {
        return _queue(worker, 1, payload);
    };

    function _console_fn(name) {
        return function (fn) {
            var args = _baseSlice(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = _baseSlice(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _arrayEach(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    }
    async.log = _console_fn('log');
    async.dir = _console_fn('dir');
    /*async.info = _console_fn('info');
    async.warn = _console_fn('warn');
    async.error = _console_fn('error');*/

    async.memoize = function (fn, hasher) {
        var memo = {};
        var queues = {};
        hasher = hasher || function (x) {
            return x;
        };
        function memoized() {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            var key = hasher.apply(null, args);
            if (key in memo) {
                async.nextTick(function () {
                    callback.apply(null, memo[key]);
                });
            }
            else if (key in queues) {
                queues[key].push(callback);
            }
            else {
                queues[key] = [callback];
                fn.apply(null, args.concat([function () {
                    memo[key] = _baseSlice(arguments);
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        }
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    function _times(mapper) {
        return function (count, iterator, callback) {
            mapper(_range(count), iterator, callback);
        };
    }

    async.times = _times(async.map);
    async.timesSeries = _times(async.mapSeries);
    async.timesLimit = function (count, limit, iterator, callback) {
        return async.mapLimit(_range(count), limit, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = _baseSlice(arguments);

            var callback = args.slice(-1)[0];
            if (typeof callback == 'function') {
                args.pop();
            } else {
                callback = noop;
            }

            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = _baseSlice(arguments, 1);
                    cb(err, nextargs);
                }]));
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };


    function _applyEach(eachfn, fns /*args...*/) {
        function go() {
            var that = this;
            var args = _baseSlice(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, _, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        }
        if (arguments.length > 2) {
            var args = _baseSlice(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    }

    async.applyEach = function (/*fns, args...*/) {
        var args = _baseSlice(arguments);
        return _applyEach.apply(null, [async.eachOf].concat(args));
    };
    async.applyEachSeries = function (/*fns, args...*/) {
        var args = _baseSlice(arguments);
        return _applyEach.apply(null, [async.eachOfSeries].concat(args));
    };


    async.forever = function (fn, callback) {
        var done = only_once(callback || noop);
        var task = ensureAsync(fn);
        function next(err) {
            if (err) {
                return done(err);
            }
            task(next);
        }
        next();
    };

    function ensureAsync(fn) {
        return function (/*...args, callback*/) {
            var args = _baseSlice(arguments);
            var callback = args.pop();
            args.push(function () {
                var innerArgs = arguments;
                if (sync) {
                    async.setImmediate(function () {
                        callback.apply(null, innerArgs);
                    });
                } else {
                    callback.apply(null, innerArgs);
                }
            });
            var sync = true;
            fn.apply(this, args);
            sync = false;
        };
    }

    async.ensureAsync = ensureAsync;

    // Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = async;
    }
    // AMD / RequireJS
    else if (typeof define !== 'undefined' && define.amd) {
        define([], function () {
            return async;
        });
    }
    // included directly via <script> tag
    else {
        root.async = async;
    }

}());

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"_process":10}],10:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}]},{},[5])(5)
});