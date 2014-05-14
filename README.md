# fs-traversal
A traversal framework for FamilySearch using the visitor pattern.

# TODO

* Document `on` return in `person`, `parent`, `child`, and `marriage`.
* Fully define visiting order via image.

# Usage

# Examples
See genealogysystems.github.io/fs-traversal

# Testing
// TODO

# Reference

### FSTraversal(fs-sdk)
Creates and returns a traversal object. Takes in an initialized FS-SDK object.
````javascript
FamilySearch.init({access_token: '12345'});

var traversal = FSTraversal(FamilySearch);
````



### .order(type)
Sets the order of the traversal. Order processed is lowest to highest. Possible values are:

* `distance` - Every relationship followed increases the distance by one, regardless of direction.
* `ancestry` - Will travel parent links first, then marriage, then children.
* `descendancy` - Will travel children links first, then marriage, then parents.
* `wrd` - Uses [Weighted Relationship distance](http://fht.byu.edu/prev_workshops/workshop13/papers/baker-beyond-fhtw2013.pdf).

````javascript
traversal.order('distance')...
````



### .concurrency(number)
The maximum number of concurrent requests to the FamilySearch API. Defaults to 5.
````javascript
traversal.concurrency(2)...
````



### .filter(function)
Given a person node and all relationships associated with that node, returns a list of edges that the traversal will follow.
May be called multiple times to set multiple functions, whose results will be "anded" together (the edge must be returned from every function to traverse).
The maximum number of concurrent requests to the FamilySearch API. Defaults to 5.
````javascript
function parentsOnly(person, relationships, callback) {
  var follow = [];

  // Only follow parent relationships
  for(var x in relationships) {
    if(relationships[x].type == 'parent') {
      follow.push(relationships[x]);
    }
  }

  callback(follow);
}

traversal.filter(parentsOnly)...
````



### .person(function)
Specify a function to be called for each person visited in the traversal. You may call this function multiple times to register multiple callbacks.

**function(person, callback)**

* `person` is an instance of a [FamilySearcg SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `callback` is a function that accepts an (optional) return parameter that will be emitted by `on`.

**Example**

````javscript
function(person, callback) {
}
````
Any value passed into the callback will be emited from `.on()`.



### .parent(function)
Specify a function to be called for each child-parent pair visited in the traversal. You may call this function multiple times to register multiple callbacks. Note that if a child has two or more parents this function will be called once for each pair.

**function(parent, child, callback)**

* `parent` is an instance of a [FamilySearcg SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `child` is an instance of a [FamilySearcg SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `callback` is a function that accepts an (optional) return parameter that will be emitted by `on`.



### .child(function)
Specify a function to be called for each child-parent-parent ternary relationship visited in the traversal. You may call this function multiple times to register multiple callbacks.

**function(child, mother, father, callback)**

* `child` is an instance of a [FamilySearcg SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `mother` is an instance of a [FamilySearcg SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `father` is an instance of a [FamilySearcg SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `callback` is a function that accepts an (optional) return parameter that will be emitted by `on`.



### .marriage(function)
Called once for each marriage.
````javscript
function(marriage, wife, husband, callback) {
  
}
````

### .on(type, function)
Values passed to the callback function in `person`, `parent`, `child`, and `marriage`.



### .status()
Will return the current traversal status. Possible values are:

* `ready` - The traversal is setup and ready to be started.
* `running` - The traversal is currently running.
* `paused` - The traversal is currently pasued. Call `resume()` to continue.
* `done` - The traversal is done. Calling `traverse()` will NOT start a new traversal.



### .pause()
Will immediately pause the traversal. Note that outstanding API requests will be queued for processing.



### .resume()
Resume a paused traversal.



### .limit(number)
If called, the traversal will only visit `number` of nodes in total.



### .error(function)
Called on Error.



### .done(function)
Called when the traversal is complete.



### .traverse(start)
Begin the traversal starting at `start`, which should be a valid FS Person Id (ex. `LZNY-BRX`).