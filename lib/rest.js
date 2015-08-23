var qs = require('querystring'),
    util = require('./util');

var rest = module.exports = {};

var DIRECTION = {
  FORWARD: 'forward',
  BACKWARD: 'backward'
};

rest.datePaged = function(opt) {
  var hasPrev = existsPreviousLink(opt),
      hasNext = existsNextLink(opt);

  removeRemainingItem(opt, hasPrev);

  if (hasPrev) buildLink(opt, DIRECTION.BACKWARD);
  if (hasNext) buildLink(opt, DIRECTION.FORWARD);
};

function removeRemainingItem (opt, hasPrev) {
  if (!opt.data.list.length || opt.data.list.length <= opt.limit) return;
  if (opt.query.dir !== DIRECTION.BACKWARD) return opt.data.list.pop();
  if (hasPrev) return opt.data.list.shift();
}

function existsNextLink (opt) {
  if (!opt.limit) return true;
  return opt.data.list.length > opt.limit || (opt.query.dir === DIRECTION.BACKWARD && opt.data.list.length === opt.limit);
}

function existsPreviousLink (opt) {
  if (!opt.query.offset_id) return false;
  if (opt.data.list.length === 1) return true;
  return (opt.query.offset_id !== opt.data.list[0][opt.idField]) &&
         (opt.data.list.length > opt.limit || opt.query.dir === DIRECTION.FORWARD);
}

function buildLink (opt, direction) {
  var isNext = direction === DIRECTION.FORWARD,
      index = isNext ? opt.data.list.length - 1 : 0,
      item = opt.data.list[index],
      q = util.clone(opt.query);

  if (!opt.data._links) opt.data._links = {};

  var offset = util.getPropertyValue(opt.sortFieldName, item);
  if (offset) {
    if (util.isDate(offset)) q.offset_date = offset.toISOString();
    else q.offset_sort = offset.toString();
  }

  var offsetId = util.getPropertyValue(opt.idField, item);
  if (offsetId) q.offset_id = offsetId.toString();

  q.dir = direction;

  opt.data._links[isNext ? 'next' : 'previous'] = { href: opt.root + '?' + qs.stringify(q) };
}


rest.addSelfLink = function(data, id, root) {
  data._links = data._links || {};

  data._links.self = { href: root + '/' + data[id] };
};
