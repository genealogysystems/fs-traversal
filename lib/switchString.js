/**
 * Generate a coded string representing the relationship path
 */
module.exports = function(path){
  var switchStr = '';
  for(var i = 1; i < path.length; i++) {
    switch(path[i].rel) {
      case 'child':
        switch(path[i].person.gender.type){
          case 'http://gedcomx.org/Male':
            switchStr += 's';
            break;
          case 'http://gedcomx.org/Female':
            switchStr += 'd';
            break;
          default:
            switchStr += 'c';
            break;
        }
        break;
      case 'mother':
        switchStr += 'm';
        break;
      case 'father':
        switchStr += 'f';
        break;
      case 'spouse':
        switch(path[i].person.gender.type){
          case 'http://gedcomx.org/Male':
            switchStr += 'h';
            break;
          case 'http://gedcomx.org/Female':
            switchStr += 'w';
            break;
          default:
            return '';
        }
        break;
      default:
        return '';
    }
  }
  return switchStr;
};