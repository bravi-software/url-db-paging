var Sort = require('./sort');

var Paging = module.exports = function (opt) {
  this.rest = require('./rest');
  this.sort = new Sort(opt);
  this.opt = opt;

  this.opt.sortFieldName = this.sort.sortFieldName;

  if (this.opt.queryBuilderType) validateQueryBuilderType(this.opt.queryBuilderType);
};

var VALID_DB_QUERY_TYPE = ['mongoose', 'solr', 'knex'];

Paging.prototype.addSortDbQuery = function(queryBuilder, type) {
  if (!type) type = this.opt.queryBuilderType;
  validateQueryBuilderType(type);

  if (type === 'mongoose') this.sort.addPagingMongoQuery(queryBuilder);
  if (type === 'solr') this.sort.addPagingSolrQuery(queryBuilder);
  if (type === 'knex') this.sort.addPagingKnexQuery(queryBuilder);
};

Paging.prototype.buildPagingResult = function(data) {
  if (!Array.isArray(data)) data = [];

  this.opt.data = { list: data };

  if (!this.opt.data.list.length) return this.opt.data;

  if (!this.sort.isForwardPagging) this.opt.data.list.reverse();
  this.rest.datePaged(this.opt);

  return this.opt.data;
};

Paging.prototype.getSortQuery = function(type, primaryField) {
  if (!type) type = this.opt.queryBuilderType;
  validateQueryBuilderType(type);

  if (type === 'mongoose') return this.sort.getSortMongoQuery(primaryField);
  if (type === 'solr') return this.sort.getSortSolrQuery(primaryField);
  if (type === 'knex') return this.sort.getSortKnexQuery(primaryField);
};

Paging.prototype.getLimitQuery = function() {
  // use limit + 1 due paging
  return this.opt.limit + 1;
};

function validateQueryBuilderType (type) {
  if (!~VALID_DB_QUERY_TYPE.indexOf(type)) throw new Error('Invalid query builder type.');
}

Paging.RestUtils = require('./rest');

Paging.prototype.addSelfLink = function(data, id, root) {
  if (!id) id = this.opt.idField;
  if (!root) root = this.opt.root;

  this.rest.addSelfLink(data, id, root);
};

Paging.prototype.addSelfLinkInAllItems = function(data, id, root) {
  var that = this;
  if (!id) id = this.opt.idField;
  if (!root) root = this.opt.root;

  data.list.forEach(function (item) {
    that.rest.addSelfLink(item, id, root);
  });
};
