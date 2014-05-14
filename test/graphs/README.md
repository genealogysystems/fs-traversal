Mock family trees (graphs) used during testing.

## Format

```javascript
{
  
  // Tell us who the base person is
  baseid: 1,
  
  // ID is required. Name is useful for display and our own sanity
  persons: [
    {id:1, name:'base person'},
    {id:2, name:'spouse'},
    {id:3, name:'father'},
    {id:4, name:'mother'}
  ],
  
  // I know that it seems like a waste to have an object with one
  // attribute but I'm allowing for additional data in the future
  marriages: [    
    {spouses:[1,2]},
    {spouses:[3,4]}
  ],
  
  childofs: [
    {child:1, father:3, mother:4},
    {child:5, father:1, mother:2}
  ]
}
```