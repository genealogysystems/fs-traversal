FSTraversal(fsClient)
  .order('distance')
  .concurrency(1)
  .limit(10)
  .person(function(person, callback) {
    console.log('visited ' + person.$getDisplayName());
  })
  .done(function() {
    console.log('complete');
  })
  .traverse();