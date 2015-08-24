export function getPropertyValue(propName, item) {
  const names = propName.split('.');
  let obj = item;

  names.forEach(name => obj = obj[name]);

  return obj;
}


export function isDate(date) {
  return typeof date.getMonth === 'function';
}
