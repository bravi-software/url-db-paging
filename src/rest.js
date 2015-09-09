import qs from 'querystring';
import { DIRECTION } from './search-providers/search-provider';


export function datePaged(opt) {
  const hasPrev = existsPreviousLink(opt);
  const hasNext = existsNextLink(opt);

  removeRemainingItem(opt, hasPrev);

  if (hasPrev) buildLink(opt, DIRECTION.BACKWARD);
  if (hasNext) buildLink(opt, DIRECTION.FORWARD);
}

function removeRemainingItem(opt, hasPrev) {
  /* eslint consistent-return: 0 */
  if (!opt.data.list.length || opt.data.list.length <= opt.limit) return;
  if (opt.query.dir !== DIRECTION.BACKWARD) return opt.data.list.pop();
  if (hasPrev) return opt.data.list.shift();
}

function existsNextLink(opt) {
  if (!opt.limit) return true;
  return opt.data.list.length > opt.limit || (opt.query.dir === DIRECTION.BACKWARD && opt.data.list.length === opt.limit);
}

function existsPreviousLink(opt) {
  if (!opt.query.offset_id) return false;
  if (opt.data.list.length === 1) return true;
  return (opt.query.offset_id !== opt.data.list[0][opt.idField]) &&
         (opt.data.list.length > opt.limit || opt.query.dir === DIRECTION.FORWARD);
}

function buildLink(opt, direction) {
  const isNext = direction === DIRECTION.FORWARD;
  const index = isNext ? opt.data.list.length - 1 : 0;
  const item = opt.data.list[index];
  const q = { ...opt.query };

  if (!opt.data._links) opt.data._links = {};

  const offset = getPropertyValue(opt.sortFieldName, item);

  if (offset) {
    if (isDate(offset)) q.offset_date = offset.toISOString();
    else q.offset_sort = offset.toString();
  }

  const offsetId = getPropertyValue(opt.idField, item);
  if (offsetId) q.offset_id = offsetId.toString();

  q.dir = direction;

  opt.data._links[isNext ? 'next' : 'previous'] = { href: opt.root + '?' + qs.stringify(q) };
}


export function addSelfLink(data, id, root) {
  data._links = data._links || {};

  data._links.self = { href: root + '/' + data[id] };
}

function getPropertyValue(propName, item) {
  if (propName.column && propName.json) {
    return item[propName.json];
  }

  const names = propName.split('.');
  let obj = item;

  names.forEach(name => obj = obj[name]);

  return obj;
}


function isDate(date) {
  return typeof date.getMonth === 'function';
}
