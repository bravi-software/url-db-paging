exports.clone = function(source) {
  var dest = {};

  if (!source || typeof source !== 'object') return dest;

  var keys = Object.keys(source);
  for (var i = 0; i < keys.length; i++) {
    dest[keys[i]] = source[keys[i]];
  }

  return dest;
};


exports.getPropertyValue = function (propName, item) {
  var names = propName.split('.'),
      obj = item;

  names.forEach(function (name) {
    obj = obj[name];
  });

  return obj;
};


exports.isDate = function (date) {
  return typeof date.getMonth === 'function';
};
