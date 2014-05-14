# fs-traversal
A traversal framework for FamilySearch using the visitor pattern.

# Usage
````javascript
FamilySearch.init({access_token: '12345'});

var traversal = FSTraversal(FamilySearch);

````

# Examples
See genealogysystems.github.io/fs-traversal

# Testing
We have a fairly comprehensive test suite, as well as a mock FamilySearch SDK.
````bash
# cd to the cloned repo and run
mocha
````

# Reference

### FSTraversal(fs-sdk)
Creates and returns a traversal object. Takes in an initialized FS-SDK object.
````javascript
FamilySearch.init({access_token: '12345'});

var traversal = FSTraversal(FamilySearch);
````



### .order(type)
Sets the order of the traversal. Order processed is lowest to highest. Defaults to `wrd`.

Possible values are:

* `ancestry` - Will travel parent links first, then marriage, then children.
* `descendancy` - Will travel children links first, then marriage, then parents.
* `distance` - Every relationship followed increases the distance by one, regardless of direction.
* `wrd` - Uses [Weighted Relationship distance](http://fht.byu.edu/prev_workshops/workshop13/papers/baker-beyond-fhtw2013.pdf).

````javascript
traversal.order('distance')...
````



### .concurrency(number)
The maximum number of concurrent requests to the FamilySearch API. Defaults to `5`.
````javascript
traversal.concurrency(2)...
````



### .limit(number)
If called, the traversal will only visit `number` of nodes in total. Defaults to `Infinity`.
````javascript
traversal.concurrency(2)...
````


### .filter(function)
Given a person node and all relationships associated with that node, returns a list of edges that the traversal will follow.
May be called multiple times to set multiple functions, whose results will be "anded" together (the edge must be returned from every function to traverse).
````javascript
function parentsOnly(personId, relationships) {
  var follow = {};

  // Only follow parent relationships
  for(var x in relationships) {
    if(relationships[x].type == 'mother' || relationships[x].type == 'father') {
      follow[x] = relationships[x]; 
    }
  }

  return follow;
}

traversal.filter(parentsOnly)...
````

**Parameters**

* `personId`
* `relationships` is an object keyed by the person id with a value that looks like:
    ````javascript
    {
      type: 'child', // One of child, mother, father, or marriage.
      depth: 2, // The generational distance we are from the root person. Parent is depth+1, child is depth-1 
      distance: 4, // The total number of hops we are away from the rootperson.
      wrd: {
        g: 2, // See wrd in .order()
        c: 1, // See wrd in .order()
        m: 0, // See wrd in .order()
        up: true
      },
      path: [] // An array representing the path to this person from the root person.
               // [id, 'father', id, 'spouse', ...]
    }
    ````



### .person(function)
Specify a function to be called for each person visited in the traversal. You may call this function multiple times to register multiple callbacks.
````javascript
function personCallback(person) {
  
}

traversal.person(personCallback)...
````

**Parameters**

* `person` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).



### .parent(function)
Specify a function to be called for each child-parent pair visited in the traversal. You may call this function multiple times to register multiple callbacks. Note that if a child has two or more parents this function will be called once for each pair.
````javascript
function parentCallback(parent, child, childRelationshipId) {
  
}

traversal.parent(parentCallback)...
````

**Parameters**

* `parent` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `child` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).

* `childRelationshipId` is the ternary child-parent-parent relationship identifier.


### .child(function)
Specify a function to be called for each child-parent-parent ternary relationship visited in the traversal. You may call this function multiple times to register multiple callbacks.
````javascript
function childCallback(child, mother, father, childRelationshipId) {
  
}

traversal.child(childCallback)...
````

**Parameters**

* `child` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `mother` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `father` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `childRelationshipId` is the ternary child-parent-parent relationship identifier.



### .marriage(function)
Specify a function to be called for each marriage relationship visited in the traversal. You may call this function multiple times to register multiple callbacks.
````javascript
function marriageCallback(wife, husband, marriageId) {
  
}

traversal.child(marriageCallback)...
````

**Parameters**

* `wife` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `husband` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `marriageId` is the marriage relationship identifier.


### .status()
Will immediately return the current traversal status.
````javascript
var status = traversal.status();
````

Possible values are:

* `ready` - The traversal is setup and ready to be started.
* `running` - The traversal is currently running.
* `paused` - The traversal is currently pasued. Call `resume()` to continue.
* `done` - The traversal is done. Calling `traverse()` will NOT start a new traversal.



### .pause()
Will immediately pause the traversal. Note that outstanding API requests will be queued for processing.
````javascript
traversal.pause();
````


### .resume()
Resume a paused traversal.
````javascript
traversal.resume();
````


### .error(function)
Called on Error.
````javascript
function errorCallback(personId, error) {
  
}

traversal.error(errorCallback)...
````

**Parameters**

* `personId`
* `error`

### .done(function)
Called when the traversal is complete.
````javascript
function errorCallback() {
  
}

traversal.error(errorCallback)...
````

**Parameters**

`None`


### .traverse(start)
Begin the traversal starting at `start`, which should be a valid FS Person Id.
````javascript
traversal.traverse(`LZNY-BRX`);
````