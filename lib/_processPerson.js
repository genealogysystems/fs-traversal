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