module.exports = {
  
  persons: [
    {id:'10', name:'base person'},
    {id:'2', name:'spouse'},
    {id:'3', name:'father'},
    {id:'4', name:'mother'},
    {id:'5', name:'child'}
  ],
  
  marriages: [    
    {husband:'10', wife:'2'},
    {husband:'3', wife:'4'}
  ],
    
  childofs: [
    {child:'10', father:'3', mother:'4'},
    {child:'5', father:'10', mother:'2'}
  ],
  
  redirects: {
    '1': '10'  
  }
  
};