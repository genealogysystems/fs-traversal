var async = require('async');

module.exports = function(sdk) {
  
  return {
    
    /**
     * The already initialized FamilySearch SDK
     * https://github.com/rootsdev/familysearch-javascript-sdk
     */
    _sdk: sdk,

    /**
     * The status of the traversal.
     * Possible values are ready, running, paused, done.
     */
    _status: 'ready',

    /**
     * The object of persons we've visited, keyed by id.
     * Note that the value is the person-with-relationships object returned by the sdk.
     */
    _visited: {},

    /**
     * The object of person id's we've fetched so far.
     * Note that we place these in here before calling the API.
     * It is possible that the API call failed, in which case we
     * do NOT clean these out. Use visited to see of a node has
     * been visited successfully.
     */
    _fetched: {},

    /**
     * The total number of people we've fetched.
     * Defaults to 1 because we always fetch the root person.
     */
    _count: 1,

    /**
     * Our traversal options.
     */
    _options: {
      limit: Infinity,
      order: 'wrd',
      wrdFactors: {
        gPositive: 1, // We allow different values for g >= 0 vs g < 0
        gNegative: 1,
        c: 1,
        m: 1
      }
    },
    
    /**
     * Use an async priority queue to manage concurrency
     * of outstanding FS API requests
     */
    _queue: null,

    /**
     * Expose functions to change options
     */
    order: function(type) {
      var orders = ['wrd','distance','ancestry','descendancy'];
      if(orders.indexOf(type) === -1) {
        throw new Error('invalid order');
      }
      
      // Make sure we haven't or are not currently traversing.
      if(this._status !== 'ready') {
        throw new Error('You may only set the order before starting a traversal');
      }
      
      this._options.order = type;
      
      // If ancestry or descendancy, add a filter
      if(type === 'ancestry'){
        this.filter(ancestryFilter);
      }
      else if(type === 'descendancy'){
        this.filter(descendancyFilter);
      }

      return this;
    },
    
    /**
     * Set the WRD factors.
     */
    wrd: function(obj) {
      this._options.wrdFactors = obj;

      return this;
    },

    /**
     * Set a limit on the number of people to visit
     */
    limit: function(num) {
      if(typeof num !== 'number') {
        throw new Error('invalid limit');
      }
      this._options.limit = num;

      return this;
    },
    
    /**
     * Set the concurrency of the queue
     */
    concurrency: function(num) {
      if(typeof num !== 'number') {
        throw new Error('invalid concurrency');
      }
      if(this._queue){
        this._queue.concurrency = num;
        this._options.concurrency = num;
      } else {
        this._options.concurrency = num;
      }

      return this;
    },
    
    /**
     * Takes in a visited person id and returns the path array of format:
     * [{rel: 'relationship', person: personObject}, ... ]
     */
    pathTo: function(id){
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
    },
    
    /**
     * Takes in a visited id and produces a string representing the relationship to the root node.
     */
    relationshipTo: function(id) {
      if(!this._fetched[id]) {
        return '';
      }

      var path = this.pathTo(id);

      return this._relationshipTo(path);
    },

    /**
     * Internal function that takes in a path and returns a human-readable string.
     * The relationship is calculated by first generating a coded string that
     * represents the path, then examining the string in chunks of decreasing size
     * to find the most relevant or shortest way to describe the relationship.
     */
    _relationshipTo: function(path) {

      // Short circuit on base-person special case
      if(path.length === 1){
        return 'yourself';
      }

      var switchStr = generateSwitchString(path),
          relation = '',
          remainder = '',
          done = false;
          
      while(!done) {
        
        rel = '';

        // Find a match for the current portion of the string, if we can
        for(var i = 0; i < relConfig.length; i++){
          var c = relConfig[i];
          if(c.regex.test(switchStr)){
            if(_isString(c.rel)){
              rel = c.rel;
            }
            else if(_isFunction(c.rel)){
              rel = c.rel(switchStr);
            }
            else {
              throw new Exception('Expected relConfig.rel to be a string or a function');
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
    },

    /**
     * Pause the traversal
     */
    pause: function(){
      if(this._queue){
        this._queue.pause();
        this._status = 'paused';
      }
    },
    
    /**
     * Resume a paused traversal
     */
    resume: function(){
      if(this._queue && this._queue.paused){
        this._queue.resume();
        this._status = 'running';
      }
    },

    /**
     * All of our registered callbacks.
     */
    _callbacks: {
      filter: [],
      person: [],
      child: [],
      children: [],
      parent: [],
      parents: [],
      marriage: [],
      spouses: [],
      relationships: [],
      error: [],
      done: []
    },

    /**
     * Register callbacks for different types.
     */
    filter: function(func) {this._registerCallback('filter', func); return this;},
    person: function(func) {this._registerCallback('person', func); return this;},
    child: function(func) {this._registerCallback('child', func); return this;},
    children: function(func) {this._registerCallback('children', func); return this;},
    parent: function(func) {this._registerCallback('parent', func); return this;},
    parents: function(func) {this._registerCallback('parents', func); return this;},
    marriage: function(func) {this._registerCallback('marriage', func); return this;},
    spouses: function(func) {this._registerCallback('spouses', func); return this;},
    relationships: function(func) {this._registerCallback('relationships', func); return this;},
    done: function(func) {this._registerCallback('done', func); return this;},
    error: function(func) {this._registerCallback('error', func); return this;},

    _registerCallback: function(type, func) {
      if(typeof func !== 'function') {
        throw new Error(type+' must register a function');
      }
      if(this._callbacks[type] == undefined) {
        throw new Error('Unknown type '+ type);
      }
      this._callbacks[type].push(func);
    },

    status: function() {
      return this._status;
    },

    /**
     * Traversal function returns a new object with new state.
     */
    traverse: function() {
      var self = this;

      if(arguments.length == 1) {
        self._traverse(arguments[0]);
      } else {
        self._sdk.getCurrentUser().done(function(response){
          self._traverse(response.getUser().personId);
        });
      }

      return self;
    },

    /**
     * Internal traversal function
     */
    _traverse: function(start) {
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

      self._fetched[start] = {
        type: 'root',
        depth: 0,
        distance: 0,
        wrd: {
          g: 0,
          c: 0,
          m: 0,
          up: false
        },
        path: [{
          rel: 'start',
          person_id: start
        }]
      }
      
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
      }, self._options.concurrency);
      
      self._queue.push(start);
      
      // Fire done callbacks when the queue drains
      self._queue.drain = function(){
        self._status = 'done';
        each(self._callbacks.done, function(cb){
          setTimeout(function(){ 
            cb.call(self); 
          });
        });
      };
      
      return self;
    },

    _processPerson: function(person) {
      var self = this,
          id = person.getPrimaryId(),
          fetched = this._fetched[id],
          rels = {},
          ids;

      // Create fetched objects from the person relationships
      each(person.getChildIds(), function(childId){
        if(!self._fetched[childId]) {
          rels[childId] = {
            rel: 'child',
            depth: fetched.depth - 1,
            distance: fetched.distance + 1,
            wrd: {
              g: fetched.wrd.g - 1,
              c: (fetched.wrd.up) ? fetched.wrd.c + 1 : fetched.wrd.c,
              m: fetched.wrd.m,
              up: fetched.wrd.up
            },
            // Use concat to create a copy while appending new data
            path: fetched.path.concat([{rel: 'child', person_id: childId}])
          };
        }
      })
      
      each(person.getFatherIds(), function(fatherId){
        if(!self._fetched[fatherId]) {
          rels[fatherId] = {
            rel: 'father',
            depth: fetched.depth + 1,
            distance: fetched.distance + 1,
            wrd: {
              g: fetched.wrd.g + 1,
              c: (fetched.wrd.c == 0) ? 0 : fetched.wrd.c + 1,
              m: fetched.wrd.m,
              up: true
            },
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
            wrd: {
              g: fetched.wrd.g + 1,
              c: (fetched.wrd.c == 0) ? 0 : fetched.wrd.c + 1,
              m: fetched.wrd.m,
              up: true
            },
            path: fetched.path.concat([{rel: 'mother', person_id: motherId}])
          };
        }
      });
      
      each(person.getSpouseIds(), function(spouseId){
        if(!self._fetched[spouseId]) {
          rels[spouseId] = {
            rel: 'marriage',
            depth: fetched.depth,
            distance: fetched.distance + 1,
            wrd: {
              g: fetched.wrd.g,
              c: fetched.wrd.c,
              m: fetched.wrd.m + 1,
              up: fetched.wrd.up
            },
            path: fetched.path.concat([{rel: 'spouse', person_id: spouseId}])
          };
        }
      });

      // Filter the objects we are going to fetch by calling the filter functions
      var filtered = [rels];
      each(self._callbacks.filter, function(cb){
        // Pass in a copy of rels
        filtered.push(cb.call(self, id, JSON.parse(JSON.stringify(rels))));
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
          sortedIds.push(x);
        }
      });

      // Sort rels 
      sortedIds.sort(function(a,b) {
        return self._calcWeight(rels[a]) - self._calcWeight(rels[b]);
      });

      // Queue additional person calls
      each(sortedIds, function(personId){
        // WARNING: Even though we filtered out already fetched people
        // if filter was async we may have processed some in another "thread"
        if(!self._fetched[personId]) {
          if(self._count < self._options.limit) {
            self._count++;
            self._fetched[personId] = rels[personId];
            self._queue.push(personId, self._calcWeight(self._fetched[personId]));
          }
        }
      });

      // Visit Person and mark as visited
      self._visited[id] = person;
      each(self._callbacks.person, function(cb) {
        setTimeout(function() {
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
              cb.call(self, self._visited[wifeId].getPrimaryPerson(), self._visited[husbandId].getPrimaryPerson(), marriage);
            });
          })
        }
      });

      // For the person and each spouse, see if all of their spouses have been visited.
      // If so, call spouses callback
      spouseCheck = _unique(spouseCheck);
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
                cb.call(self, self._visited[fromSpouse].getPrimaryPerson(), spouses);
              });
            });
          }
        }
      });

      // Visit Child (only when visited all persons)
      // Visit Parent (only when visited all persons)
      var childParents = person.getChildRelationships(),
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
              cb.call(self, 
                self._visited[childId].getPrimaryPerson(), 
                (motherId)?self._visited[motherId].getPrimaryPerson():undefined, 
                (fatherId)?self._visited[fatherId].getPrimaryPerson():undefined, 
                childParent);
            });
          });

          // Call the parent callback with mother if mother is defined
          if(motherId) {
            each(self._callbacks.parent, function(cb){
              setTimeout(function() {
                cb.call(self, self._visited[motherId].getPrimaryPerson(), self._visited[childId].getPrimaryPerson());
              });
            });
          }

          // Call the parent callback with father
          if(fatherId) {
            each(self._callbacks.parent, function(cb){
              setTimeout(function() {
                cb.call(self, self._visited[fatherId].getPrimaryPerson(), self._visited[childId].getPrimaryPerson());
              });
            });
          }
        }
      });

      // For the person and each parent, see if all of their children have been visited.
      // If so, call children callback
      childrenCheck = _unique(childrenCheck);
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
                cb.call(self, self._visited[parent].getPrimaryPerson(), children);
              });
            });
          }
        }
      });

      // For the person and each child, see if all of their parents have been visited.
      // If so, call parents callback
      parentCheck = _unique(parentCheck);
      each(parentCheck, function(child) {
        if(self._visited[child]) {
          var parentIds = _unique(self._visited[child].getFatherIds().concat(self._visited[child].getMotherIds())),
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
                cb.call(self, self._visited[child].getPrimaryPerson(), parents);
              });
            });
          }
        }
      });

      // For the person and each person related, check to see if every relationship has been visited.
      // If so, call relationships callback
      
      relationshipsCheck = _unique(relationshipsCheck);
      each(relationshipsCheck, function(relation) {
        if(self._visited[relation]) {
          var allVisited = true,
              related = [];
          
          // Check the persons parents
          var parentIds = _unique(self._visited[relation].getFatherIds().concat(self._visited[relation].getMotherIds()))
          each(parentIds, function(parentId){
            if(!self._visited[parentId]) {
              allVisited = false;
            } else {
              related.push(self._visited[parentId].getPrimaryPerson());
            }
          });

          // Check the persons children
          var childrenIds = self._visited[relation].getChildIds()
          each(childrenIds, function(childId){
            if(!self._visited[childId]) {
              allVisited = false;
            } else {
              related.push(self._visited[childId].getPrimaryPerson());
            }
          });

          // Check the persons spouses
          var spouseIds = self._visited[relation].getSpouseIds()
          each(spouseIds, function(spouseId){
            if(!self._visited[spouseId]) {
              allVisited = false;
            } else {
              related.push(self._visited[spouseId].getPrimaryPerson());
            }
          });

          // Call the relationships callback if everyone has been visited
          if(allVisited) {
            each(self._callbacks.relationships, function(cb){
              setTimeout(function() {
                cb.call(self, self._visited[relation].getPrimaryPerson(), self._visited[relation], related);
              });
            });
          }
        }
      });

    },

    /**
     * Calculates the weight for the node.
     */
    _calcWeight: function(fetchObj) {
      switch(this._options.order) {
        case 'wrd':
          // Calculates the weighted relationship distance value.
          // Based on http://fht.byu.edu/prev_workshops/workshop13/papers/baker-beyond-fhtw2013.pdf
          var wrd = fetchObj.wrd;
              G = ((wrd.g >= 0)?this._options.wrdFactors.gPositive:this._options.wrdFactors.gNegative)*(Math.abs(wrd.g)+1),
              C = Math.pow(Math.E, (this._options.wrdFactors.c*wrd.c)),
              M = Math.pow(Math.E, (this._options.wrdFactors.m*wrd.m));

          return G*C*M;
        case 'ancestry':
          return fetchObj.depth * -1;
        case 'descendancy':
          return fetchObj.depth;
        case 'distance':
          return fetchObj.distance;
        default:
          return 0;
      }
    }

  }
};

var relConfig = [
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
    pattern: '(s|d)s',
    rel: 'grandson'
  },
  {
    pattern: '(s|d)d',
    rel: 'granddaughter'
  },
  {
    pattern: '(s|d)c',
    rel: 'grandchild'
  },
  {
    pattern: '(h|w)f',
    rel: 'father-in-law'
  },
  {
    pattern: '(h|w)m',
    rel: 'mother-in-law'
  },
  {
    pattern: '(h|w)(m|f)s',
    rel: 'brother-in-law'
  },
  {
    pattern: '(h|w)(m|f)d',
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
    pattern: '(d|s){2}s',
    rel: 'great-grandson'
  },
  {
    pattern: '(d|s){2}d',
    rel: 'great-granddaughter'
  },
  {
    pattern: '(d|s){2}d',
    rel: 'great-grandchild'
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

function isMale(gender){
  return gender === 'http://gedcomx.org/Male';
};

function isFemale(gender){
  return gender === 'http://gedcomx.org/Female';
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
        }
        break;
      default:
        return '';
    }
  }
  return switchStr;
};

/**
 * Filter function used by the ancestry traversal
 */
function ancestryFilter(personId, relationships){
  var persons = {};
  for(var id in relationships){
    var rel = relationships[id];
    if(rel.depth == rel.distance){
      persons[id] = rel;
    }
  }
  return persons;
};

/**
 * Filter function used by the descendancy traversal
 */
function descendancyFilter(personId, relationships){
  var persons = {};
  for(var id in relationships){
    var rel = relationships[id];
    if(-rel.depth == rel.distance){
      persons[id] = rel;
    }
  }
  return persons;
};

/**
 * Lifted from underscore.js
 * http://underscorejs.org/docs/underscore.html#section-15
 */
function each(obj, iterator, context) {
  if (obj == null) return obj;
  if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, length = obj.length; i < length; i++) {
      iterator.call(context, obj[i], i, obj);
    }
  } else {
    var keys = _keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      iterator.call(context, obj[keys[i]], keys[i], obj);
    }
  }
  return obj;
};

function _keys(obj) {
  if (!obj === Object(obj)) return [];
  if (Object.keys) return Object.keys(obj);
  var keys = [];
  for (var key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
  return keys;
};

function _unique(array) {
  var results = [];

  each(array, function(val){
    if(results.indexOf(val) == -1) {
      results.push(val);
    }
  });
  return results;
};

function _isString(obj){
  return toString.call(obj) == '[object String]'
};

function _isFunction(obj){
  return toString.call(obj) == '[object Function]'
};