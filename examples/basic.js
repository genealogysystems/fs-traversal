FSTraversal(fsClient)
  .limit(10)
  .person(function(person) {
    console.log('visited ' + person.getDisplayName());
  })
  .done(function() {
    console.log('complete');
  })
  .start();