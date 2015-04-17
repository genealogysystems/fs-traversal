[![Build Status](https://travis-ci.org/genealogysystems/fs-traversal.svg?branch=master)](https://travis-ci.org/genealogysystems/fs-traversal)
[![Coverage Status](https://coveralls.io/repos/genealogysystems/fs-traversal/badge.svg?branch=master)](https://coveralls.io/r/genealogysystems/fs-traversal?branch=master)
[![Dependency Status](https://david-dm.org/genealogysystems/fs-traversal.svg)](https://david-dm.org/genealogysystems/fs-traversal)
[![devDependency Status](https://david-dm.org/genealogysystems/fs-traversal/dev-status.svg)](https://david-dm.org/genealogysystems/fs-traversal#info=devDependencies)

# fs-traversal

Given a starting person, it traverses through the tree (graph) using the visitor pattern to fire callbacks when people and relationships are visited.

Requires the [FamilySearch Javascript SDK](https://github.com/rootsdev/familysearch-javascript-sdk).

# Usage

```js
FamilySearch.init({access_token: '12345'});

var traversal = FSTraversal(FamilySearch);

traversal
  .limit(10)
  .order('distance')
  .concurrency(2)
  .person(function(person) {
    console.log('visited '+person.$getDisplayName());
  })
  .done(function() {
    console.log('done!');
  });

traversal.traverse();
```

# Examples

See [http://genealogysystems.github.io/fs-traversal](http://genealogysystems.github.io/fs-traversal).

# Testing

We have a fairly comprehensive test suite, as well as a mock FamilySearch SDK.
```bash
# cd to the cloned repo and run
mocha
```

# Reference

### FSTraversal(fs-sdk)

Creates and returns a traversal object. Takes in an initialized FS-SDK object.
```js
FamilySearch.init({access_token: '12345'});

var traversal = FSTraversal(FamilySearch);
```

### .order(order)

Sets the order of the traversal. May either be a string to use a built-in order
or a function to use a [custom order](#custom-orders). Defaults to `distance`.

Built-in orders:

* `distance` - Every relationship followed increases the distance by one, regardless of direction.
* `wrd` - Uses [Weighted Relationship Distance](http://fht.byu.edu/prev_workshops/workshop13/papers/baker-beyond-fhtw2013.pdf).
* `wrd-far` - Alternative to WRD that addresses some issues. See [issue #17](https://github.com/genealogysystems/fs-traversal/issues/17) for details.

```js
traversal.order('wrd')
```

### .filter(filter)

Filters can be used to restrict traversal independently of order. `filter` may
either be a string, to use a built-in filter, or a function to use a [custom filter](#custom-filters).

Built-in filters:

* `ancestry` - Only visit direct ancestors.
* `descendancy` - Only visit direct descendants.
* `ancestry-descendancy` - Visit direct ancestors and direct descendants.
* `cousins` - Visit direct ancestors, direct descendants, and all direct descendants of ancestors (cousins). Does not include spouses; not even the spouse of the starting person.
* `cousins-spouses` - Same as `cousins` except it _does_ include spouses of any matching persons.

### .concurrency(number)

The maximum number of concurrent requests to the FamilySearch API. Defaults to `1`.

```js
traversal.concurrency(2)...
```

### .limit(number)

If called, the traversal will only visit `number` of nodes in total. Defaults to `Infinity`.

```js
traversal.limit(100)...
```

### .person(function)

Specify a function to be called for each person visited in the traversal. You may call this function multiple times to register multiple callbacks.

```js
traversal.person(function(person){
  console.log('visited '+person.$getDisplayName());
})
```

**Parameters**

* `person` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).


### .parent(function)

Specify a function to be called for each child-parent pair visited in the traversal. You may call this function multiple times to register multiple callbacks. Note that if a child has two or more parents this function will be called once for each pair.

```js
traversal.parent(function(parent, child){
  console.log(child.$getDisplayName()+' is the child of '+parent.$getDisplayName());
})
```

**Parameters**

* `parent` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `child` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).

### .parents(function)

Specify a function to be called for a person and all of their parents. You may call this function multiple times to register multiple callbacks.

```js
traversal.parents(function(person, parents){
  console.log('person:'+person.$getDisplayName());
})
```

**Parameters**

* `person` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `parents` is an array of [FamilySearch SDK Persons](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).

### .child(function)

Specify a function to be called for each child-parent-parent ternary relationship visited in the traversal. You may call this function multiple times to register multiple callbacks.

```js
traversal.child(function(child, mother, father, childRelationship){
  console.log('child:'+child.$getDisplayName());
  console.log('mother:'+mother.$getDisplayName());
  console.log('father:'+father.$getDisplayName());
})
```

**Parameters**

* `child` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `mother` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `father` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `childRelationship` is an instance of a [FamilySearch SDK ChildAndParents](http://rootsdev.org/familysearch-javascript-sdk/#/api/parentsAndChildren.types:constructor.ChildAndParents).

### .children(function)

Specify a function to be called for a person and all of their children. You may call this function multiple times to register multiple callbacks.

```js
traversal.children(function(person, children){
  console.log('person:'+person.$getDisplayName());
})
```

**Parameters**

* `person` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `children` is an array of [FamilySearch SDK Persons](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).

### .marriage(function)

Specify a function to be called for each marriage relationship visited in the traversal. You may call this function multiple times to register multiple callbacks.

```js
traversal.marriage(function(wife, husband, marriage){
  console.log(wife.$getDisplayName()+' married '+husband.$getDisplayName());
})
```

**Parameters**

* `wife` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `husband` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `marriage` is an instance of a [FamilySearch SDK Couple](http://rootsdev.org/familysearch-javascript-sdk/#/api/spouses.types:constructor.Couple).

### .spouses(function)

Specify a function to be called for a person and all of their spouses. You may call this function multiple times to register multiple callbacks.

```js
traversal.spouses(function(person, spouses){
  console.log('person:'+person.$getDisplayName());
})
```

**Parameters**

* `person` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `spouses` is an array of [FamilySearch SDK Persons](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).

### .family(function)

Specify a function to be called for each distinct family. You may call this function multiple times to register multiple callbacks.

```js
traversal.family(function(wife, husband, children){

});
```

**Parameters**

* `wife` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `husband` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `children` is an array of [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).

`wife` or `husband` may be undefined though at least one is guaranteed to be defined.
`children` is guaranteed to have at least one entry in the array.

### .relationships(function)

Specify a function to be called for a person and all of their relationships. You may call this function multiple times to register multiple callbacks.

```js
traversal.relationships(function(person, relationships, people){
  console.log('person:'+person.$getDisplayName());
})
```

**Parameters**

* `person` is an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* `relationships` is an instance of a [FamilySearch SDK PersonWithRelationships](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.functions:getPersonWithRelationships).
* `people` is an object of [FamilySearch SDK Persons](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person) keyed by person ID.

### .status()

Will immediately return the current traversal status.

```js
var status = traversal.status();
```

Possible values are:

* `ready` - The traversal is setup and ready to be started.
* `running` - The traversal is currently running.
* `paused` - The traversal is currently pasued. Call `resume()` to continue.
* `done` - The traversal is done. Calling `traverse()` will NOT start a new traversal.

### .pause()

Will immediately pause the traversal. Note that outstanding API requests will be queued for processing.

```js
traversal.pause();
```

### .resume()

Resume a paused traversal.

```js
traversal.resume();
```

### .stop()

Stop traversal. Cannot be restarted. Use `pause()` if you expect to resume.

```js
traversal.stop();
```

### .error(function)

Called on Error.

```js
traversal.error(function(personId, error){
  console.error('Something went wrong fetching person '+personId);
  console.error(error);
})
```

**Parameters**

* `personId`
* `error`

### .done(function)

Called when the traversal is complete.

```js
traversal.error(function(){
  console.log('Traversal Complete!');
})
```

### .traverse([start])

Begin the traversal starting at `start`, which should be a valid FS Person Id.
If start is not passed in, the traversal will start from the user returned by `FamilySearch.getCurrentUser()`.

```js
traversal.traverse('LZNY-BRX');
```

### .relationshipTo(id)

Call a traveral object and pass in a person-id to get the relationship from the root person to the person-id.

```js
var str = traversal.relationshipTo(id);
console.log(str);
// str is a string, like "grandparent".
```

### .pathTo(id)

Get an array representing the path to a person that has been visited.

```js
var path = traversal.pathTo(id);
console.log(path);
// [{rel: 'start', person: Person}, {rel: 'father', person: Person}, ... ]
``` 

* All person objects are an instance of [FamilySearch.Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person).
* The first person in the array is the start person for the traversal.
* Possible values for the relationships strings are `start`, `child`, `father`, `mother`, `spouse`.

## Custom Orders and Filters

### Custom Orders

Traversal order is managed by a priority queue. Each person is assigned a weight
which determines their in the queue. Lower numbers are a higher priority. 
Order functions calculate and return a number representing the person's weight.
Order functions are given [position objects](#position-objects).

The built-in distance order function just returns the distance.

```js
traversal.order(function(fetchObj){
  return fetchObj.distance;
})
```

`wrd` and `wrd-far` examine the path to calculate a weighted number that gives
priority to close and direct ancestors. For a depth-first traversal you could 
return the negated distance.

Additional parameters can be specified which are in turn passed into the order 
function each time it's called. This can be used to adjust the weights used
in the `wrd` calculation.

```js
traversal.order('wrd', {
  gPositive: 1,
  gNegative: 1.76,
  c: 1,
  m: 1.42
})
```

### Custom Filters

Custom filter functions are given the current person object 
(an instance of a [FamilySearch SDK Person](http://rootsdev.org/familysearch-javascript-sdk/#/api/person.types:constructor.Person))
and a list of [position objects](#position-objects) for all related persons keyed by person id. 
The function must return a list of relationships that should be followed. 
When multiple filter functions are set, the results are anded together meaning 
the traversal only follows relationships that are returned by _all_ filter functions.

```js
traversal.filter(function(person, relationships){
  var follow = {};

  // Only follow parent relationships
  for(var x in relationships) {
    if(relationships[x].rel == 'mother' || relationships[x].rel == 'father') {
      follow[x] = relationships[x]; 
    }
  }

  return follow;
});
```

### Position Objects

These objects are used internally by FSTraversal to track a person's position in
the graph. They are exposed to order and filter functions.

```js
{
  rel: 'child', // One of child, mother, father, or spouse. Represents this person's relationship to the previous person in the path.
  depth: 2, // The generational distance we are from the root person. Parent is depth+1, child is depth-1 
  distance: 4, // The total number of hops we are away from the root person.
  path: [] // An array representing the path to this person from the root person.
           // [{rel: 'start', person_id: personId}, {rel: 'father', person_id: personId}, ...]
}
```