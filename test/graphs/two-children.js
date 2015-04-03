// Used to test the bug where the children callback isn't always called
module.exports = {
  
  persons: [
    {id:'1', name:'base person'},
    {id:'2', name:'spouse'},
    {id:'3', name:'son'},
    {id:'4', name:'daughter'}
  ],
  
  marriages: [    
    {husband:'1', wife:'2'}
  ],
    
  childofs: [
    {child:'3', father:'1', mother:'2'},
    {child:'4', father:'1', mother:'2'}
  ]
  
};