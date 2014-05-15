FSTraversal(FamilySearch)
  .order('wrd')
  .limit(5)
  .person(function(person, callback) {
    console.log('visited ' + person.$getDisplayName());
  })
  .traverse('LZNY-BRX');