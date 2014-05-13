# fs-traversal
A Traversal Framework for FamilySearch using the visitor pattern.

# Usage

# Examples
see genealogysystems.github.io/fs-traversal

# Testing
// TODO

# Reference

### FSTraversal(fs-sdk)
Creates and returns a traversal object. Takes in an initialized FS-SDK object.
````javascript
var sdk = FamilySearch.init({access_token: '12345'});

var traversal = FSTraversal(sdk);
````

### .order(type)
Sets the order of the traversal. Possible values are:

* `breadth`
* `depth`
* `wrd` [documented here](http://fht.byu.edu/prev_workshops/workshop13/papers/baker-beyond-fhtw2013.pdf)

````javascript
traversal.order('breadth')...
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
A callback function is executed once for every person traversed.
````javscript
function(person, callback) {
  
}
````
Any value passed into the callback will be emited from `.on()`.

### .parent(function)
Called once for each child-parent pair. Note that child is also called.
````javscript
function(parent, child, callback) {
  
}
````
Any value passed into the callback will be emited from `.on()`.

### .child(function)
Called once for each child, parent, parent ternary relationship. Note that parent is called for each child-parent pair.
````javscript
function cb(child, mother, father callback) {
  
}

traversal.child(cb)...
````
Any value passed into the callback will be emited from `.on()`.

### .marriage(function)
Called once for each marriage.
````javscript
function(marriage, wife, husband, callback) {
  
}
````

### .on(type, function)
Values passed to the callback function in `person`, `parent`, `child`, and `marriage`.


### .pause()

### .resume()

### .limit(number)
If called, the traversal will only visit `number` of nodes in total.

### .error(function)

### .done(function)

### .traverse(start)