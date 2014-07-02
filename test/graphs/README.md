Mock family trees (graphs) used during testing.

## Format

```javascript
{
  
  // ID is required. Name is useful for display and our own sanity
  persons: [
    {id:1, name:'base person'},
    {id:2, name:'spouse'},
    {id:3, name:'father'},
    {id:4, name:'mother'}
  ],
  
  marriages: [    
    {husband:'1', wife:'2'},
    {husband:'3', wife:'4'}
  ],
  
  childofs: [
    {child:1, father:3, mother:4},
    {child:5, father:1, mother:2}
  ]
}
```