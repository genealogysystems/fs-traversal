var traversal = FSTraversal(fsClient)
  .order('wrd')
  .filter('ancestry')
  .concurrency(10)
  .limit(30)
  .person(function(person) {
    console.log('visited ' + person.$getDisplayName());
    console.log('relationship: ' + traversal.relationshipTo(person.id));
  })
  .parent(function(parent, child){
    console.log(child.$getDisplayName()+' is the child of '+parent.$getDisplayName());
  })
  .child(function(child, mother, father, childRelationship){
    console.log('child:'+child.$getDisplayName());
    console.log('mother:'+mother.$getDisplayName());
    console.log('father:'+father.$getDisplayName());
  })
  .marriage(function(wife, husband, marriage){
    console.log(wife.$getDisplayName()+' married '+husband.$getDisplayName());
  })
  .error(function(personId, error){
    console.error('Something went wrong fetching person '+personId);
    console.error(error);
  })
  .done(function(){
    console.log('Traversal Complete!');
  });

console.log('status: '+traversal.status());

traversal.start();

setTimeout(function(){
  console.log('status: '+traversal.status());
  console.log('pausing traversal');
  traversal.pause();

  setTimeout(function(){
    console.log('status: '+traversal.status());
    console.log('resuming traversal');
    traversal.resume();

  }, 5000);

}, 10000);