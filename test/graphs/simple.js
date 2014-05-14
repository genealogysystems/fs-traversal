module.exports = {
  
  persons: [
    {id:1, name:'base person'},
    {id:2, name:'spouse'},
    {id:3, name:'father'},
    {id:4, name:'mother'},
    {id:5, name:'child'}
  ],
  
  marriages: [    
    {spouses:[1,2]},
    {spouses:[3,4]}
  ],
    
  childofs: [
    {child:1, father:3, mother:4},
    {child:5, father:1, mother:2}
  ]
  
};