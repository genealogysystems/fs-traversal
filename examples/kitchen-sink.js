var traversal = FSTraversal(FamilySearch)
  .order('distance')
  .concurrency(1)
  .limit(30)
  .filter(function(personId, relationships) {
    var follow = {};

    // Only follow parent relationships
    for(var x in relationships) {
      if(relationships[x].type == 'mother' || relationships[x].type == 'father') {
        follow[x] = relationships[x]; 
      }
    }

    return follow;
  })
  .person(function(person, callback) {
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

traversal.traverse();

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