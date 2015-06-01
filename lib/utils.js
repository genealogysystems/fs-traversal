var utils = module.exports;

/**
 * Lifted from underscore.js
 * http://underscorejs.org/docs/underscore.html#section-15
 */
utils.each = function(obj, iterator, context) {
  if (obj == null) return obj;
  if (Array.prototype.forEach && obj.forEach === Array.prototype.forEach) {
    obj.forEach(iterator, context);
  } else if (obj.length === +obj.length) {
    for (var i = 0, length = obj.length; i < length; i++) {
      iterator.call(context, obj[i], i, obj);
    }
  } else {
    var keys = utils.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      iterator.call(context, obj[keys[i]], keys[i], obj);
    }
  }
  return obj;
};

utils.keys = function(obj) {
  if (!obj === Object(obj)) return [];
  if (Object.keys) return Object.keys(obj);
  var keys = [];
  for (var key in obj) if (hasOwnProperty.call(obj, key)) keys.push(key);
  return keys;
};

utils.unique = function(array) {
  var results = [];

  utils.each(array, function(val){
    if(results.indexOf(val) == -1) {
      results.push(val);
    }
  });
  return results;
};

utils.isString = function(obj){
  return Object.prototype.toString.call(obj) === '[object String]';
};

utils.isFunction = function(obj){
  return Object.prototype.toString.call(obj) === '[object Function]' || typeof obj === 'function';
};

utils.isArray = function(obj){
  return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]';
};