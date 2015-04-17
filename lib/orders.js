var utils = require('./utils');

var orders = module.exports = {};

orders.distance = function(fetchObj){
  return fetchObj.distance;
};

/**
 * Calculate the weight for a wrd traversal
 * Based on http://fht.byu.edu/prev_workshops/workshop13/papers/baker-beyond-fhtw2013.pdf
 */
orders.wrd = function(fetchObj, wrdFactors){
  
  if(!wrdFactors){
    wrdFactors = {
      gPositive: 1,
      gNegative: 1,
      c: 1,
      m: 1
    };
  }
  
  var wrd = {
    g: 0,
    c: 0,
    m: 0,
    up: false
  };
  
  utils.each(fetchObj.path, function(rel){
    switch(rel.rel) {
      case 'child':
        wrd.g -= 1;
        wrd.c = wrd.up ? wrd.c + 1 : wrd.c;
        break;
      case 'father':
      case 'mother':
        wrd.g += 1;
        wrd.c = wrd.c == 0 ? 0 : wrd.c + 1;
        wrd.up = true;
        break;
      case 'spouse':
        wrd.m += 1;
        break;
    }
  });

  var G = ((wrd.g >= 0) ? wrdFactors.gPositive : wrdFactors.gNegative) * (Math.abs(wrd.g) + 1),
      C = Math.pow(Math.E, wrdFactors.c * wrd.c),
      M = Math.pow(Math.E, wrdFactors.m * wrd.m);
  return G*C*M
};

/**
 * Inspired by WRD, developed by FAR to fix the problem with collateral lines
 */
orders['wrd-far'] = function(fetchObj){
  
  // Short circuit on all relationships of distance one
  // Helps us deal with siblings in a better way
  if(fetchObj.distance === 1){
    return 1;
  }
  
  var path = fetchObj.path,
      d = fetchObj.distance,
      s = 0, // Number of sibling relationships
      c = 0, // Number of collateral line changes
      dc = 0; // Distance travelled since entering first collateral line
      
  for(var i = 1; i < fetchObj.path.length; i++){
    if(c){
      dc++;
    }
    if(path[i].rel === 'spouse'){
      c++;
    }
    else {
      var currentChild = _isChildRel(path[i].rel),
          currentParent = _isParentRel(path[i].rel),
          prevChild = _isChildRel(path[i-1].rel),
          prevParent = _isParentRel(path[i-1].rel);
      if((currentChild && prevParent) || (currentParent && prevChild)){
        c++;
        s += .5;
      }
    }
  }
  
  var w = (d - s) * Math.pow(Math.E, c * 1.4) * Math.pow(Math.E, (dc - s) * 1.5);
  
  return w;
};
function _isParentRel(rel){
  return rel === 'mother' || rel === 'father';
};
function _isChildRel(rel){
  return rel === 'child';
};