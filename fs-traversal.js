function FSTraversal(sdk) {
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
     * Note that the value is the person object returned by the sdk.
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

    _count: 0,

    /**
     * Our traversal options.
     */
    _options: {
      limit: Infinity,
      order: 'wrd',
      wrdFactors: {
        gPositive: 1, // We allow different values for g >= 0 vs g < 0
        gNegative: 1.76,
        c: 1,
        m: 1.42
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
      if(type != 'wrd' && type != 'depth' && type != 'distance') {
        throw new Error('invalid order');
      }
      // Make sure we haven't or are not currently traversing.
      if(this._status !== 'ready') {
        throw new Error('You may only set the order before starting a traversal');
      }
      this._options.order = type;

      return this;
    },
    
    limit: function(num) {
      if(typeof num !== 'number') {
        throw new Error('invalid limit');
      }
      this._options.limit = num;

      return this;
    },
    
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
     * All of our registered callbacks.
     */
    _callbacks: {
      filter: [],
      person: [],
      child: [],
      parent: [],
      marriage: [],
      data_person: [],
      data_child: [],
      data_parent: [],
      data_marriage: [],
      error: [],
      done: []
    },

    /**
     * Register callbacks for different types.
     */
    filter: function(func) {this._registerCallback('filter', func); return this;},
    person: function(func) {this._registerCallback('person', func); return this;},
    child: function(func) {this._registerCallback('child', func); return this;},
    parent: function(func) {this._registerCallback('parent', func); return this;},
    marriage: function(func) {this._registerCallback('marriage', func); return this;},
    done: function(func) {this._registerCallback('done', func); return this;},
    error: function(func) {this._registerCallback('error', func); return this;},
    on: function(type, func) {this._registerCallback('data_'+type, func); return this;},

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
    traverse: function(start) {
      var self = this;

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
        path: []
      }
      
      self._queue = async.priorityQueue(function(personId, callback){
        self._sdk.getPersonWithRelationships(personId).then(function(response) {
          callback();
          self._processPerson(response);
        });
      }, self._options.concurrency);
      
      self._queue.push(start);
    },

    _processPerson: function(person) {
      var self = this,
          id = person.getPrimaryId(),
          fetched = this._fetched[id],
          rels = {},
          ids;

      // Create fetched objects from the person relationships
      ids = person.getChildIds();
      for(var x in ids) {
        if(!self._fetched[ids[x]]) {
          rels[ids[x]] = {
            type: 'child',
            depth: fetched.depth - 1,
            distance: fetched.distance + 1,
            wrd: {
              g: fetched.wrd.g - 1,
              c: (fetched.wrd.up) ? fetched.wrd.c + 1 : fetched.wrd.c,
              m: fetched.wrd.m,
              up: fetched.wrd.up
            },
            path: fetched.path.concat(['child'])
          };
        }
      }
      ids = person.getFatherIds();
      for(var x in ids) {
        if(!self._fetched[ids[x]]) {
          rels[ids[x]] = {
            type: 'father',
            depth: fetched.depth + 1,
            distance: fetched.distance + 1,
            wrd: {
              g: fetched.wrd.g + 1,
              c: (fetched.wrd.c == 0) ? 0 : fetched.wrd.c + 1,
              m: fetched.wrd.m,
              up: true
            },
            path: fetched.path.concat(['father'])
          };
        }
      }
      ids = person.getMotherIds();
      for(var x in ids) {
        if(!self._fetched[ids[x]]) {
          rels[ids[x]] = {
            type: 'mother',
            depth: fetched.depth + 1,
            distance: fetched.distance + 1,
            wrd: {
              g: fetched.wrd.g + 1,
              c: (fetched.wrd.c == 0) ? 0 : fetched.wrd.c + 1,
              m: fetched.wrd.m,
              up: true
            },
            path: fetched.path.concat(['mother'])
          };
        }
      }
      ids = person.getSpouseIds();
      for(var x in ids) {
        if(!self._fetched[ids[x]]) {
          rels[ids[x]] = {
            type: 'marriage',
            depth: fetched.depth,
            distance: fetched.distance + 1,
            wrd: {
              g: fetched.wrd.g,
              c: fetched.wrd.c,
              m: fetched.wrd.m + 1,
              up: fetched.wrd.up
            },
            path: fetched.path.concat(['spouse'])
          };
        }
      }

      // Filter the objects we are going to fetch by calling the filter functions
      // TODO

      // Sort rels 
      var sortedKeys = [];
      for(var x in rels) {
        sortedKeys.push(x);
      }

      sortedKeys.sort(function(a,b) {
        return self._calcWeight(rels[a]) - self._calcWeight(rels[b]);
      });

      // Queue additional person calls
      for(var x in sortedKeys) {
        var personId = sortedKeys[x];
        // WARNING: Even though we filtered out already fetched people
        // if filter was async we may have processed some in another "thread"
        if(!self._fetched[personId]) {
          if(self._count < self._options.limit) {
            self._count++;
            self._fetched[personId] = rels[personId];
            self._queue.push(personId, self._calcWeight(self._fetched[personId]));
          }
        }
      }


      // Visit Person and mark as visited
      self._visited[id] = person.getPrimaryPerson();
      for(var x in self._callbacks.person) {
        (function(x, id){
          setTimeout(function() {
            self._callbacks.person[x].call(self, self._visited[id]);
          }, 0);
        }(x, id))
      }

      // Visit Marriages (only when visited all persons)
      var marriages = person.getSpouseRelationships();
      for(var x in marriages) {
        var marriage = marriages[x];
        if(self._visited[marriage.$getHusbandId()] && self._visited[marriage.$getWifeId()]) {
          (function(hid, wid) {

            for(var y in self._callbacks.marriage) {
              setTimeout(function() {
                self._callbacks.marriage[y].call(self, self._visited[wid], self._visited[hid]);
              }, 0);
            }

          })(marriage.$getHusbandId(), marriage.$getWifeId());
        }
      }

      // Visit Child (only when visited all persons)

      // Visit Parent (only when visited all persons)
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
        case 'depth':
          return fetchObj.depth * -1;
        case 'distance':
          return fetchObj.distance;
        default:
          return 0;
      }
    }

  }
}