(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.FSTraversal = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

  // Create fetched objects from the person relationships
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

  // Filter the objects we are going to fetch by calling the filter functions
  var filtered = [rels];
  each(self._callbacks.filter, function(cb){
    // Pass in a copy of rels
    filtered.push(cb.call(self, person.getPrimaryPerson(), JSON.parse(JSON.stringify(rels))));
  });

  // Add and sort only those ids who were not filtered out. 
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

  // Mark as visited
  self._visited[id] = person;
  
  // Handle redirects by aliasing the returned id to the requested id
  if(person.wasRedirected()){
    self._visited[person.getRequestedId()] = self._visited[id];
  }
  
  // Call person callbacks
  each(self._callbacks.person, function(cb) {
    setTimeout(function() {
      if(self._isStopped()){
        return;
      }
      cb.call(self, self._visited[id].getPrimaryPerson());
    });
  });

  var relationshipsCheck = [id];
  
  // Visit Marriages (only when visited all persons)
  var marriages = person.getSpouseRelationships(),
      spouseCheck = [id]; // Always check this person as well as all of their spouses
  each(marriages, function(marriage){
    var husbandId = marriage.$getHusbandId(),
        wifeId = marriage.$getWifeId();

    if(id == husbandId && wifeId) {
      spouseCheck.push(wifeId);
      relationshipsCheck.push(wifeId);
    }

    if(id == wifeId && husbandId) {
      spouseCheck.push(husbandId);
      relationshipsCheck.push(husbandId);
    }

    if(self._visited[husbandId] && self._visited[wifeId]) {
      each(self._callbacks.marriage, function(cb){
        setTimeout(function() {
          if(self._isStopped()){
            return;
          }
          cb.call(self, self._visited[wifeId].getPrimaryPerson(), self._visited[husbandId].getPrimaryPerson(), marriage);
        });
      });
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
        each(self._callbacks.spouses, function(cb){
          setTimeout(function() {
            if(self._isStopped()){
              return;
            }
            cb.call(self, self._visited[fromSpouse].getPrimaryPerson(), spouses);
          });
        });
      }
    }
  });

  // Visit Child (only when visited all persons)
  // Visit Parent (only when visited all persons)
  var childParents = person.getChildRelationships().concat(person.getParentRelationships()),
      childrenCheck = [id], // Always check this person as well as all of their parents
      parentCheck = [id]; // Always check this person as well as all of their children
  each(childParents, function(childParent){
    
    var childId = childParent.$getChildId(),
        motherId = childParent.$getMotherId(),
        fatherId = childParent.$getFatherId();
    
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
      each(self._callbacks.child, function(cb){
        setTimeout(function() {
          if(self._isStopped()){
            return;
          }
          cb.call(self, 
            self._visited[childId].getPrimaryPerson(), 
            (motherId)?self._visited[motherId].getPrimaryPerson():undefined, 
            (fatherId)?self._visited[fatherId].getPrimaryPerson():undefined, 
            childParent);
        });
      }); 
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
      each(self._callbacks.parent, function(cb){
        setTimeout(function() {
          if(self._isStopped()){
            return;
          }
          cb.call(self, self._visited[motherId].getPrimaryPerson(), self._visited[childId].getPrimaryPerson());
        });
      });
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
      each(self._callbacks.parent, function(cb){
        setTimeout(function() {
          if(self._isStopped()){
            return;
          }
          cb.call(self, self._visited[fatherId].getPrimaryPerson(), self._visited[childId].getPrimaryPerson());
        });
      });
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
        each(self._callbacks.children, function(cb){
          setTimeout(function() {
            if(self._isStopped()){
              return;
            }
            cb.call(self, self._visited[parent].getPrimaryPerson(), children);
          });
        });
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
        each(self._callbacks.parents, function(cb){
          setTimeout(function() {
            if(self._isStopped()){
              return;
            }
            cb.call(self, self._visited[child].getPrimaryPerson(), parents);
          });
        });
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
        each(self._callbacks.relationships, function(cb){
          setTimeout(function() {
            if(self._isStopped()){
              return;
            }
            cb.call(self, self._visited[relation].getPrimaryPerson(), self._visited[relation], related);
          });
        });
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
    var familyId = childParents.$getMotherId() + ':' + childParents.$getFatherId();
    
    // Setup the family if we haven't seen it yet
    if(!families[familyId]){
      families[familyId] = {
        wifeId: childParents.$getMotherId(),
        husbandId: childParents.$getFatherId(),
        childrenIds: []
      };
    }
    
    // Add the child
    families[familyId].childrenIds.push(childParents.$getChildId());
  });

  // For each resulting familie:
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
      each(self._callbacks.family, function(cb){
        setTimeout(function() {
          if(self._isStopped()){
            return;
          }
          cb.call(self, wife, husband, children);
        });
      });
    }
  });
};
},{"./utils":6}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
var async = require('async'),
    orders = require('./orders'),
    filters = require('./filters'),
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
 * Traversal function returns a new object with new state.
 */
FSTraversal.prototype.traverse = function() {
  var self = this;

  if(arguments.length == 1) {
    self._traverse(arguments[0]);
  } else {
    self._sdk.getCurrentUser().done(function(response){
      self._traverse(response.getUser().personId);
    });
  }

  return self;
};

/**
 * Internal traversal function
 */
FSTraversal.prototype._traverse = function(start) {
  var self = this;

  // Make sure a start point was given
  if(typeof start === 'undefined'){
    throw new Error('Must specify a starting person id');
  }
  
  // Make sure we haven't or are not currently traversing.
  if(self._status !== 'ready') {
    throw new Error('You may only start a traversal when status is ready');
  }

  self._status = 'running';

  var fetchStart = self._fetched[start] = {
    type: 'root',
    depth: 0,
    distance: 0,
    weight: 0,
    path: [{
      rel: 'start',
      person_id: start
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
    }).fail(function(error){
      each(self._callbacks.error, function(cb){
        setTimeout(function(){
          cb.call(self, personId, error);
        });
      });
    });
  }, self._concurrency);
  
  self._queue.push(start);
  
  // Fire done callbacks when the queue drains
  self._queue.drain = function(){
    self._status = 'done';
    each(self._callbacks.done, function(cb){
      if(self._isStopped()){
        return;
      }
      setTimeout(function(){ 
        cb.call(self); 
      });
    });
  };
  
  return self;
};

// This was put into a separate file because it's so big
FSTraversal.prototype._processPerson = require('./_processPerson');

var relConfig = require('./relConfigs');



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
FSTraversal.prototype.relationshipTo = function(id) {
  if(!this._fetched[id]) {
    return '';
  }

  var path = this.pathTo(id);

  return this._relationshipTo(path);
};

/**
 * Internal function that takes in a path and returns a human-readable string.
 * The relationship is calculated by first generating a coded string that
 * represents the path, then examining the string in chunks of decreasing size
 * to find the most relevant or shortest way to describe the relationship.
 */
FSTraversal.prototype._relationshipTo = function(path) {

  // Short circuit on base-person special case
  if(path.length === 1){
    return 'yourself';
  }

  var switchStr = generateSwitchString(path),
      relation = '',
      remainder = '',
      done = false;
  
  while(!done) {
    
    var rel = '';

    // Find a match for the current portion of the string, if we can
    for(var i = 0; i < relConfig.length; i++){
      var c = relConfig[i];
      if(c.regex.test(switchStr)){
        if(utils.isString(c.rel)){
          rel = c.rel;
        }
        else if(utils.isFunction(c.rel)){
          rel = c.rel(switchStr);
        }
        else {
          throw new Error('Expected relConfig.rel to be a string or a function');
        }
        break;
      }
    }

    // If we found a match, update the relationship string
    // and prepare to examine the remaining portion
    if(rel) {
      relation += ((relation)?"'s ":'')+rel;
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

      // If we empty the switch string without finding anything, add "relative" and be done
      if(!switchStr) {
        rel += ((rel)?"'s ":'')+'relative';
        done = true;
      }
    }

  }

  return relation;
};

/**
 * Generate a coded string representing the relationship path
 */
function generateSwitchString(path){
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

},{"./_processPerson":1,"./filters":2,"./orders":4,"./relConfigs":5,"./utils":6,"async":7}],4:[function(require,module,exports){
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
},{"./utils":6}],5:[function(require,module,exports){
var each = require('./utils').each;

var relConfig = module.exports = [
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
    pattern: '(s|d|c){2}d',
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
];

// Create regex objects for relConfig. This is done
// so that we don't need to generate correct regex
// objects in the patterns with leading ^ and
// trailing $. This wouldn't be useful if we allowed
// regex to only examine portions of a rel string
// but we don't allow that.
each(relConfig, function(c){
  c.regex = new RegExp('^' + c.pattern + '$');
});

},{"./utils":6}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
(function (process){
/*!
 * async
 * https://github.com/caolan/async
 *
 * Copyright 2010-2014 Caolan McMahon
 * Released under the MIT license
 */
/*jshint onevar: false, indent:4 */
/*global setImmediate: false, setTimeout: false, console: false */
(function () {

    var async = {};

    // global on the server, window in the browser
    var root, previous_async;

    root = this;
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
            fn.apply(root, arguments);
        }
    }

    //// cross-browser compatiblity functions ////

    var _toString = Object.prototype.toString;

    var _isArray = Array.isArray || function (obj) {
        return _toString.call(obj) === '[object Array]';
    };

    var _each = function (arr, iterator) {
        if (arr.forEach) {
            return arr.forEach(iterator);
        }
        for (var i = 0; i < arr.length; i += 1) {
            iterator(arr[i], i, arr);
        }
    };

    var _map = function (arr, iterator) {
        if (arr.map) {
            return arr.map(iterator);
        }
        var results = [];
        _each(arr, function (x, i, a) {
            results.push(iterator(x, i, a));
        });
        return results;
    };

    var _reduce = function (arr, iterator, memo) {
        if (arr.reduce) {
            return arr.reduce(iterator, memo);
        }
        _each(arr, function (x, i, a) {
            memo = iterator(memo, x, i, a);
        });
        return memo;
    };

    var _keys = function (obj) {
        if (Object.keys) {
            return Object.keys(obj);
        }
        var keys = [];
        for (var k in obj) {
            if (obj.hasOwnProperty(k)) {
                keys.push(k);
            }
        }
        return keys;
    };

    //// exported async module functions ////

    //// nextTick implementation with browser-compatible fallback ////
    if (typeof process === 'undefined' || !(process.nextTick)) {
        if (typeof setImmediate === 'function') {
            async.nextTick = function (fn) {
                // not a direct alias for IE10 compatibility
                setImmediate(fn);
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
        if (typeof setImmediate !== 'undefined') {
            async.setImmediate = function (fn) {
              // not a direct alias for IE10 compatibility
              setImmediate(fn);
            };
        }
        else {
            async.setImmediate = async.nextTick;
        }
    }

    async.each = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        _each(arr, function (x) {
            iterator(x, only_once(done) );
        });
        function done(err) {
          if (err) {
              callback(err);
              callback = function () {};
          }
          else {
              completed += 1;
              if (completed >= arr.length) {
                  callback();
              }
          }
        }
    };
    async.forEach = async.each;

    async.eachSeries = function (arr, iterator, callback) {
        callback = callback || function () {};
        if (!arr.length) {
            return callback();
        }
        var completed = 0;
        var iterate = function () {
            iterator(arr[completed], function (err) {
                if (err) {
                    callback(err);
                    callback = function () {};
                }
                else {
                    completed += 1;
                    if (completed >= arr.length) {
                        callback();
                    }
                    else {
                        iterate();
                    }
                }
            });
        };
        iterate();
    };
    async.forEachSeries = async.eachSeries;

    async.eachLimit = function (arr, limit, iterator, callback) {
        var fn = _eachLimit(limit);
        fn.apply(null, [arr, iterator, callback]);
    };
    async.forEachLimit = async.eachLimit;

    var _eachLimit = function (limit) {

        return function (arr, iterator, callback) {
            callback = callback || function () {};
            if (!arr.length || limit <= 0) {
                return callback();
            }
            var completed = 0;
            var started = 0;
            var running = 0;

            (function replenish () {
                if (completed >= arr.length) {
                    return callback();
                }

                while (running < limit && started < arr.length) {
                    started += 1;
                    running += 1;
                    iterator(arr[started - 1], function (err) {
                        if (err) {
                            callback(err);
                            callback = function () {};
                        }
                        else {
                            completed += 1;
                            running -= 1;
                            if (completed >= arr.length) {
                                callback();
                            }
                            else {
                                replenish();
                            }
                        }
                    });
                }
            })();
        };
    };


    var doParallel = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.each].concat(args));
        };
    };
    var doParallelLimit = function(limit, fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [_eachLimit(limit)].concat(args));
        };
    };
    var doSeries = function (fn) {
        return function () {
            var args = Array.prototype.slice.call(arguments);
            return fn.apply(null, [async.eachSeries].concat(args));
        };
    };


    var _asyncMap = function (eachfn, arr, iterator, callback) {
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        if (!callback) {
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err) {
                    callback(err);
                });
            });
        } else {
            var results = [];
            eachfn(arr, function (x, callback) {
                iterator(x.value, function (err, v) {
                    results[x.index] = v;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };
    async.map = doParallel(_asyncMap);
    async.mapSeries = doSeries(_asyncMap);
    async.mapLimit = function (arr, limit, iterator, callback) {
        return _mapLimit(limit)(arr, iterator, callback);
    };

    var _mapLimit = function(limit) {
        return doParallelLimit(limit, _asyncMap);
    };

    // reduce only has a series version, as doing reduce in parallel won't
    // work in many situations.
    async.reduce = function (arr, memo, iterator, callback) {
        async.eachSeries(arr, function (x, callback) {
            iterator(memo, x, function (err, v) {
                memo = v;
                callback(err);
            });
        }, function (err) {
            callback(err, memo);
        });
    };
    // inject alias
    async.inject = async.reduce;
    // foldl alias
    async.foldl = async.reduce;

    async.reduceRight = function (arr, memo, iterator, callback) {
        var reversed = _map(arr, function (x) {
            return x;
        }).reverse();
        async.reduce(reversed, memo, iterator, callback);
    };
    // foldr alias
    async.foldr = async.reduceRight;

    var _filter = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.filter = doParallel(_filter);
    async.filterSeries = doSeries(_filter);
    // select alias
    async.select = async.filter;
    async.selectSeries = async.filterSeries;

    var _reject = function (eachfn, arr, iterator, callback) {
        var results = [];
        arr = _map(arr, function (x, i) {
            return {index: i, value: x};
        });
        eachfn(arr, function (x, callback) {
            iterator(x.value, function (v) {
                if (!v) {
                    results.push(x);
                }
                callback();
            });
        }, function (err) {
            callback(_map(results.sort(function (a, b) {
                return a.index - b.index;
            }), function (x) {
                return x.value;
            }));
        });
    };
    async.reject = doParallel(_reject);
    async.rejectSeries = doSeries(_reject);

    var _detect = function (eachfn, arr, iterator, main_callback) {
        eachfn(arr, function (x, callback) {
            iterator(x, function (result) {
                if (result) {
                    main_callback(x);
                    main_callback = function () {};
                }
                else {
                    callback();
                }
            });
        }, function (err) {
            main_callback();
        });
    };
    async.detect = doParallel(_detect);
    async.detectSeries = doSeries(_detect);

    async.some = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (v) {
                    main_callback(true);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(false);
        });
    };
    // any alias
    async.any = async.some;

    async.every = function (arr, iterator, main_callback) {
        async.each(arr, function (x, callback) {
            iterator(x, function (v) {
                if (!v) {
                    main_callback(false);
                    main_callback = function () {};
                }
                callback();
            });
        }, function (err) {
            main_callback(true);
        });
    };
    // all alias
    async.all = async.every;

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
                var fn = function (left, right) {
                    var a = left.criteria, b = right.criteria;
                    return a < b ? -1 : a > b ? 1 : 0;
                };
                callback(null, _map(results.sort(fn), function (x) {
                    return x.value;
                }));
            }
        });
    };

    async.auto = function (tasks, callback) {
        callback = callback || function () {};
        var keys = _keys(tasks);
        var remainingTasks = keys.length
        if (!remainingTasks) {
            return callback();
        }

        var results = {};

        var listeners = [];
        var addListener = function (fn) {
            listeners.unshift(fn);
        };
        var removeListener = function (fn) {
            for (var i = 0; i < listeners.length; i += 1) {
                if (listeners[i] === fn) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        var taskComplete = function () {
            remainingTasks--
            _each(listeners.slice(0), function (fn) {
                fn();
            });
        };

        addListener(function () {
            if (!remainingTasks) {
                var theCallback = callback;
                // prevent final callback from calling itself if it errors
                callback = function () {};

                theCallback(null, results);
            }
        });

        _each(keys, function (k) {
            var task = _isArray(tasks[k]) ? tasks[k]: [tasks[k]];
            var taskCallback = function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                if (err) {
                    var safeResults = {};
                    _each(_keys(results), function(rkey) {
                        safeResults[rkey] = results[rkey];
                    });
                    safeResults[k] = args;
                    callback(err, safeResults);
                    // stop subsequent errors hitting callback multiple times
                    callback = function () {};
                }
                else {
                    results[k] = args;
                    async.setImmediate(taskComplete);
                }
            };
            var requires = task.slice(0, Math.abs(task.length - 1)) || [];
            var ready = function () {
                return _reduce(requires, function (a, x) {
                    return (a && results.hasOwnProperty(x));
                }, true) && !results.hasOwnProperty(k);
            };
            if (ready()) {
                task[task.length - 1](taskCallback, results);
            }
            else {
                var listener = function () {
                    if (ready()) {
                        removeListener(listener);
                        task[task.length - 1](taskCallback, results);
                    }
                };
                addListener(listener);
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
        var wrappedTask = function(wrappedCallback, wrappedResults) {
            var retryAttempt = function(task, finalAttempt) {
                return function(seriesCallback) {
                    task(function(err, result){
                        seriesCallback(!err || finalAttempt, {err: err, result: result});
                    }, wrappedResults);
                };
            };
            while (times) {
                attempts.push(retryAttempt(task, !(times-=1)));
            }
            async.series(attempts, function(done, data){
                data = data[data.length - 1];
                (wrappedCallback || callback)(data.err, data.result);
            });
        }
        // If a callback is passed, run this as a controll flow
        return callback ? wrappedTask() : wrappedTask
    };

    async.waterfall = function (tasks, callback) {
        callback = callback || function () {};
        if (!_isArray(tasks)) {
          var err = new Error('First argument to waterfall must be an array of functions');
          return callback(err);
        }
        if (!tasks.length) {
            return callback();
        }
        var wrapIterator = function (iterator) {
            return function (err) {
                if (err) {
                    callback.apply(null, arguments);
                    callback = function () {};
                }
                else {
                    var args = Array.prototype.slice.call(arguments, 1);
                    var next = iterator.next();
                    if (next) {
                        args.push(wrapIterator(next));
                    }
                    else {
                        args.push(callback);
                    }
                    async.setImmediate(function () {
                        iterator.apply(null, args);
                    });
                }
            };
        };
        wrapIterator(async.iterator(tasks))();
    };

    var _parallel = function(eachfn, tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            eachfn.map(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            eachfn.each(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.parallel = function (tasks, callback) {
        _parallel({ map: async.map, each: async.each }, tasks, callback);
    };

    async.parallelLimit = function(tasks, limit, callback) {
        _parallel({ map: _mapLimit(limit), each: _eachLimit(limit) }, tasks, callback);
    };

    async.series = function (tasks, callback) {
        callback = callback || function () {};
        if (_isArray(tasks)) {
            async.mapSeries(tasks, function (fn, callback) {
                if (fn) {
                    fn(function (err) {
                        var args = Array.prototype.slice.call(arguments, 1);
                        if (args.length <= 1) {
                            args = args[0];
                        }
                        callback.call(null, err, args);
                    });
                }
            }, callback);
        }
        else {
            var results = {};
            async.eachSeries(_keys(tasks), function (k, callback) {
                tasks[k](function (err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    results[k] = args;
                    callback(err);
                });
            }, function (err) {
                callback(err, results);
            });
        }
    };

    async.iterator = function (tasks) {
        var makeCallback = function (index) {
            var fn = function () {
                if (tasks.length) {
                    tasks[index].apply(null, arguments);
                }
                return fn.next();
            };
            fn.next = function () {
                return (index < tasks.length - 1) ? makeCallback(index + 1): null;
            };
            return fn;
        };
        return makeCallback(0);
    };

    async.apply = function (fn) {
        var args = Array.prototype.slice.call(arguments, 1);
        return function () {
            return fn.apply(
                null, args.concat(Array.prototype.slice.call(arguments))
            );
        };
    };

    var _concat = function (eachfn, arr, fn, callback) {
        var r = [];
        eachfn(arr, function (x, cb) {
            fn(x, function (err, y) {
                r = r.concat(y || []);
                cb(err);
            });
        }, function (err) {
            callback(err, r);
        });
    };
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
            callback();
        }
    };

    async.doWhilst = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (test.apply(null, args)) {
                async.doWhilst(iterator, test, callback);
            }
            else {
                callback();
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
            callback();
        }
    };

    async.doUntil = function (iterator, test, callback) {
        iterator(function (err) {
            if (err) {
                return callback(err);
            }
            var args = Array.prototype.slice.call(arguments, 1);
            if (!test.apply(null, args)) {
                async.doUntil(iterator, test, callback);
            }
            else {
                callback();
            }
        });
    };

    async.queue = function (worker, concurrency) {
        if (concurrency === undefined) {
            concurrency = 1;
        }
        function _insert(q, data, pos, callback) {
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  callback: typeof callback === 'function' ? callback : null
              };

              if (pos) {
                q.tasks.unshift(item);
              } else {
                q.tasks.push(item);
              }

              if (q.saturated && q.tasks.length === q.concurrency) {
                  q.saturated();
              }
              async.setImmediate(q.process);
          });
        }

        var workers = 0;
        var q = {
            tasks: [],
            concurrency: concurrency,
            saturated: null,
            empty: null,
            drain: null,
            started: false,
            paused: false,
            push: function (data, callback) {
              _insert(q, data, false, callback);
            },
            kill: function () {
              q.drain = null;
              q.tasks = [];
            },
            unshift: function (data, callback) {
              _insert(q, data, true, callback);
            },
            process: function () {
                if (!q.paused && workers < q.concurrency && q.tasks.length) {
                    var task = q.tasks.shift();
                    if (q.empty && q.tasks.length === 0) {
                        q.empty();
                    }
                    workers += 1;
                    var next = function () {
                        workers -= 1;
                        if (task.callback) {
                            task.callback.apply(task, arguments);
                        }
                        if (q.drain && q.tasks.length + workers === 0) {
                            q.drain();
                        }
                        q.process();
                    };
                    var cb = only_once(next);
                    worker(task.data, cb);
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
                if (q.paused === true) { return; }
                q.paused = true;
                q.process();
            },
            resume: function () {
                if (q.paused === false) { return; }
                q.paused = false;
                q.process();
            }
        };
        return q;
    };
    
    async.priorityQueue = function (worker, concurrency) {
        
        function _compareTasks(a, b){
          return a.priority - b.priority;
        };
        
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
          if (!q.started){
            q.started = true;
          }
          if (!_isArray(data)) {
              data = [data];
          }
          if(data.length == 0) {
             // call drain immediately if there are no tasks
             return async.setImmediate(function() {
                 if (q.drain) {
                     q.drain();
                 }
             });
          }
          _each(data, function(task) {
              var item = {
                  data: task,
                  priority: priority,
                  callback: typeof callback === 'function' ? callback : null
              };
              
              q.tasks.splice(_binarySearch(q.tasks, item, _compareTasks) + 1, 0, item);

              if (q.saturated && q.tasks.length === q.concurrency) {
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
        var working     = false,
            tasks       = [];

        var cargo = {
            tasks: tasks,
            payload: payload,
            saturated: null,
            empty: null,
            drain: null,
            drained: true,
            push: function (data, callback) {
                if (!_isArray(data)) {
                    data = [data];
                }
                _each(data, function(task) {
                    tasks.push({
                        data: task,
                        callback: typeof callback === 'function' ? callback : null
                    });
                    cargo.drained = false;
                    if (cargo.saturated && tasks.length === payload) {
                        cargo.saturated();
                    }
                });
                async.setImmediate(cargo.process);
            },
            process: function process() {
                if (working) return;
                if (tasks.length === 0) {
                    if(cargo.drain && !cargo.drained) cargo.drain();
                    cargo.drained = true;
                    return;
                }

                var ts = typeof payload === 'number'
                            ? tasks.splice(0, payload)
                            : tasks.splice(0, tasks.length);

                var ds = _map(ts, function (task) {
                    return task.data;
                });

                if(cargo.empty) cargo.empty();
                working = true;
                worker(ds, function () {
                    working = false;

                    var args = arguments;
                    _each(ts, function (data) {
                        if (data.callback) {
                            data.callback.apply(null, args);
                        }
                    });

                    process();
                });
            },
            length: function () {
                return tasks.length;
            },
            running: function () {
                return working;
            }
        };
        return cargo;
    };

    var _console_fn = function (name) {
        return function (fn) {
            var args = Array.prototype.slice.call(arguments, 1);
            fn.apply(null, args.concat([function (err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (typeof console !== 'undefined') {
                    if (err) {
                        if (console.error) {
                            console.error(err);
                        }
                    }
                    else if (console[name]) {
                        _each(args, function (x) {
                            console[name](x);
                        });
                    }
                }
            }]));
        };
    };
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
        var memoized = function () {
            var args = Array.prototype.slice.call(arguments);
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
                    memo[key] = arguments;
                    var q = queues[key];
                    delete queues[key];
                    for (var i = 0, l = q.length; i < l; i++) {
                      q[i].apply(null, arguments);
                    }
                }]));
            }
        };
        memoized.memo = memo;
        memoized.unmemoized = fn;
        return memoized;
    };

    async.unmemoize = function (fn) {
      return function () {
        return (fn.unmemoized || fn).apply(null, arguments);
      };
    };

    async.times = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.map(counter, iterator, callback);
    };

    async.timesSeries = function (count, iterator, callback) {
        var counter = [];
        for (var i = 0; i < count; i++) {
            counter.push(i);
        }
        return async.mapSeries(counter, iterator, callback);
    };

    async.seq = function (/* functions... */) {
        var fns = arguments;
        return function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            async.reduce(fns, args, function (newargs, fn, cb) {
                fn.apply(that, newargs.concat([function () {
                    var err = arguments[0];
                    var nextargs = Array.prototype.slice.call(arguments, 1);
                    cb(err, nextargs);
                }]))
            },
            function (err, results) {
                callback.apply(that, [err].concat(results));
            });
        };
    };

    async.compose = function (/* functions... */) {
      return async.seq.apply(null, Array.prototype.reverse.call(arguments));
    };

    var _applyEach = function (eachfn, fns /*args...*/) {
        var go = function () {
            var that = this;
            var args = Array.prototype.slice.call(arguments);
            var callback = args.pop();
            return eachfn(fns, function (fn, cb) {
                fn.apply(that, args.concat([cb]));
            },
            callback);
        };
        if (arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);
            return go.apply(this, args);
        }
        else {
            return go;
        }
    };
    async.applyEach = doParallel(_applyEach);
    async.applyEachSeries = doSeries(_applyEach);

    async.forever = function (fn, callback) {
        function next(err) {
            if (err) {
                if (callback) {
                    return callback(err);
                }
                throw err;
            }
            fn(next);
        }
        next();
    };

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

}).call(this,require('_process'))
},{"_process":8}],8:[function(require,module,exports){
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

},{}]},{},[3])(3)
});