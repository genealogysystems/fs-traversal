!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.FSTraversal=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var async = _dereq_('async');

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
      var orders = ['wrd','distance','ancestry','descendancy','wrd-far'];
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
              cb.call(self, self._visited[fatherId].getPrimaryPerson(), self._visited[childId].getPrimaryPerson());
            });
          });
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
              related = {};
          
          // Check the persons parents
          var parentIds = _unique(self._visited[relation].getFatherIds().concat(self._visited[relation].getMotherIds()))
          each(parentIds, function(parentId){
            if(!self._visited[parentId]) {
              allVisited = false;
            } else {
              related[parentId] = self._visited[parentId].getPrimaryPerson();
            }
          });

          // Check the persons children
          var childrenIds = self._visited[relation].getChildIds()
          each(childrenIds, function(childId){
            if(!self._visited[childId]) {
              allVisited = false;
            } else {
              related[childId] = self._visited[childId].getPrimaryPerson();
            }
          });

          // Check the persons spouses
          var spouseIds = self._visited[relation].getSpouseIds()
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
          return fetchObj.depth;
        case 'descendancy':
          return fetchObj.depth * -1;
        case 'distance':
          return fetchObj.distance;
        case 'wrd-far':
          return calcWRDFAR(fetchObj);
        default:
          return 0;
      }
    }

  }
};

/**
 * Experimental FAR version of WRD
 */
function calcWRDFAR(fetchObj){
  
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
      
  for(var i = 0; i < fetchObj.path.length; i++){
    if(c){
      dc++;
    }
    if(path[i].rel === 'spouse'){
      c++;
    }
    else if(i > 0) {
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
  return Object.prototype.toString.call(obj) === '[object String]';
};

function _isFunction(obj){
  return Object.prototype.toString.call(obj) === '[object Function]' || typeof obj === 'function';
};
},{"async":2}],2:[function(_dereq_,module,exports){
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

}).call(this,_dereq_("FWaASH"))
},{"FWaASH":3}],3:[function(_dereq_,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

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
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}]},{},[1])
(1)
});