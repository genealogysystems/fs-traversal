module.exports = {
  
  persons: [
    {id:'1', name:'base person'},
    {id:'2', name:'spouse'},
    {id:'3', name:'father'},
    {id:'4', name:'mother'},
    {id:'5', name:'child'},
    {id:'6', name:'grandfather'},
    {id:'7', name:'grandmother'},
    {id:'8', name:'uncle'},
    {id:'9', name:'aunt'}
  ],
  
  marriages: [    
    {husband:'1', wife:'2'},
    {husband:'3', wife:'4'},
    {husband:'6', wife:'7'},
    {husband:'8', wife:'9'}
  ],
    
  childofs: [
    {child:'1', father:'3', mother:'4'},
    {child:'5', father:'1', mother:'2'},
    {child:'4', father:'6', mother:'7'},
    {child:'8', father:'6', mother:'7'}
  ]
  
};