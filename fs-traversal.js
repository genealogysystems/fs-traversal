function FSTraversal(sdk) {
  return {
    
    /**
     * The already initialized FamilySearch SDK
     * https://github.com/rootsdev/familysearch-javascript-sdk
     */
    _sdk: sdk,

    /**
     * The array of person id's we've visited.
     */
    _visited: [],

    /**
     * The array of person id's we've fetched.
     */
    _fetched: {},

    /**
     * Our traversal options.
     */
    _options: {
      limit: undefined,
      order: 'wrd',
      concurrency: 5
    },

    /**
     * Expose functions to change options
     */
    order: function(type) {
      if(type != 'wrd' || type != 'depth' || type != 'breadth') {
        throw new Error('invalid order');
      }
      this._options.order = type;
    },
    limit: function(num) {
      if(typeof num !== 'number') {
        throw new Error('invalid limit');
      }
      this._options.limit = num;
    },
    concurrency: function(num) {
      if(typeof num !== 'number') {
        throw new Error('invalid concurrency');
      }
      this._options.concurrency = num;
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

    /**
     * Traversal function returns a new object with new state.
     */
    traverse: function(start) {
      var self = this;
      self._fetched[start] = {
        wrd: {
          g: 0,
          c: 0,
          m: 0,
          up: false
        },
        path: []
      }
      self._sdk.getPersonWithRelationships(start).then(function(response) {
        self._processPerson(response);
      });
    },

    _processPerson: function(person) {
      var self = this,
          id = person.getPrimaryId(),
          fetched = this._fetched[id];

      if(self._visited.length > 10)  {
        console.log('done')
        return;
      }

      // Call filter
      // These are what will pe set in this._fetched
      var rels = {},
          ids;
      // TODO
      ids = person.getChildIds();
      for(var x in ids) {
        rels[ids[x]] = {
          wrd: {
            g: fetched.wrd.g - 1,
            c: (fetched.wrd.up) ? fetched.wrd.c + 1 : fetched.wrd.c,
            m: fetched.wrd.m,
            up: fetched.wrd.up
          },
          path: fetched.path.concat(['child'])
        };
      }
      ids = person.getFatherIds();
      for(var x in ids) {
        rels[ids[x]] = {
          wrd: {
            g: fetched.wrd.g + 1,
            c: (fetched.wrd.c == 0) ? 0 : fetched.wrd.c + 1,
            m: fetched.wrd.m,
            up: true
          },
          path: fetched.path.concat(['father'])
        };
      }
      ids = person.getMotherIds();
      for(var x in ids) {
        rels[ids[x]] = {
          wrd: {
            g: fetched.wrd.g + 1,
            c: (fetched.wrd.c == 0) ? 0 : fetched.wrd.c + 1,
            m: fetched.wrd.m,
            up: true
          },
          path: fetched.path.concat(['mother'])
        };
      }
      ids = person.getSpouseIds();
      for(var x in ids) {
        rels[ids[x]] = {
          wrd: {
            g: fetched.wrd.g,
            c: fetched.wrd.c,
            m: fetched.wrd.m + 1,
            up: fetched.wrd.up
          },
          path: fetched.path.concat(['spouse'])
        };
      }

      // Queue relationship calls
      for(var x in rels) {
        if(!self._fetched[x]) {
          self._fetched[x] = rels[x];
          (function(x) {
            setTimeout(function() {
              self._sdk.getPersonWithRelationships(x).then(function(response) {
                self._processPerson(response);
              });
            }, 0);
          })(x);
        }
      }


      // Visit Person and mark as visited
      for(var x in self._callbacks.person) {
        setTimeout(function() {
          self._callbacks.person[x].call(self, person.getPrimaryPerson());
        }, 0);
      }
      self._visited.push(id);

      // Visit Marriages (only when visited all persons)

      // Visit Child (only when visited all persons)

      // Visit Parent (only when visited all persons)
    }

  }
}