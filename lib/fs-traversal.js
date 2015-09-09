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