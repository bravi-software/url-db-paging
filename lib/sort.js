var util = require('util');

var DIRECTION = {
  FORWARD: 'forward',
  BACKWARD: 'backward'
};

var Sort = module.exports = function (opt) {
  this.query = opt.query;
  this.sortField = opt.query.sort || opt.defaultSortField;
  this.isSortDesc = /^-/.test(this.sortField);
  this.isForwardPagging = opt.query.dir !== DIRECTION.BACKWARD;
  this.isAscQuerySort = (!this.isSortDesc && this.isForwardPagging) || (this.isSortDesc && !this.isForwardPagging);
  this.sortFieldName = this.sortField.replace(/^-/, '');
  this.offsetPrimaryField = getOffsetValue(this.query);
  this.idField = opt.idField;
};


Sort.prototype.hasParametersToFilter = function() {
  return this.offsetPrimaryField && this.query.offset_id;
};


Sort.prototype.addPagingMongoQuery = function(dbQuery) {
  var sortFilter = this.buildPagingMongoQuery();

  dbQuery.and(sortFilter);
};


Sort.prototype.buildPagingMongoQuery = function() {
  var sortFilter = {};
  if (!this.hasParametersToFilter()) return sortFilter;

  var offsetAndIdQuery = this.buildOffsetAndIdQuery();

  if (this.isAscQuerySort) {
    var greaterThanOffsetDate = this.getMongoGreaterThanOffsetQuery();

    sortFilter.$or = [
      greaterThanOffsetDate,
      offsetAndIdQuery
    ];
  }
  else {
    var lessThanOffsetDate = this.getMongoLessThanOffsetQuery();

    sortFilter.$or = [
      lessThanOffsetDate,
      offsetAndIdQuery
    ];
  }

  sortFilter[this.idField] = { $ne: this.query.offset_id };

  return sortFilter;
};


Sort.prototype.buildOffsetAndIdQuery = function() {
  var equalOffsetDate = this.getMongoEqualOffsetQuery();

  var andId = {};

  if (this.isAscQuerySort) {
    andId[this.idField] = { $gt: this.query.offset_id };
  } else {
    andId[this.idField] = { $lt: this.query.offset_id };
  }

  return { $and: [ equalOffsetDate, andId ] };
};


Sort.prototype.addPagingSolrQuery = function(solrQuery) {
  if (!this.hasParametersToFilter()) return;

  if (this.isAscQuerySort) {
    solrQuery
      .begin()
        .where(this.sortFieldName).gt(this.offsetPrimaryField)
        .or()
        .begin()
          .where(this.sortFieldName).equals(this.offsetPrimaryField)
          .where(this.idField).gt(this.query.offset_id)
        .end()
      .end();
  } else {
    solrQuery
      .begin()
        .where(this.sortFieldName).lt(this.offsetPrimaryField)
        .or()
        .begin()
          .where(this.sortFieldName).equals(this.offsetPrimaryField)
          .where(this.idField).lt(this.query.offset_id)
        .end()
      .end();
  }
  solrQuery.where(this.idField, this.query.offset_id, { not: true });
};


Sort.prototype.addPagingKnexQuery = function(knex) {
  var that = this;
  if (!this.hasParametersToFilter()) return;

  if (this.isAscQuerySort) {
    knex.where(function () {
      this.where(that.sortFieldName, '>', that.offsetPrimaryField)
          .orWhere(function () {
            this.where(that.sortFieldName, that.offsetPrimaryField)
                .where(that.idField, '>', that.query.offset_id);
          });
    });
  } else {
    knex.where(function () {
      this.where(that.sortFieldName, '<', that.offsetPrimaryField)
          .orWhere(function () {
            this.where(that.sortFieldName, that.offsetPrimaryField)
                .where(that.idField, '<', that.query.offset_id);
          });
    });
  }
  knex.where(this.idField, '<>', this.query.offset_id);
};


Sort.prototype.getSortMongoQuery = function (primaryField) {
  var sortPrefix = this.isAscQuerySort ? '' : '-';
  return util.format('%s%s %s%s', sortPrefix, (primaryField || this.sortFieldName), sortPrefix, this.idField);
};


Sort.prototype.getSortSolrQuery = function (primaryField) {
  var sortSuffix = this.isAscQuerySort ? 'asc' : 'desc';
  return util.format('%s %s, %s %s', (primaryField || this.sortFieldName), sortSuffix, this.idField, sortSuffix);
};


Sort.prototype.getSortKnexQuery = function (primaryField) {
  var sortSuffix = this.isAscQuerySort ? 'asc' : 'desc';
  return [
    [(primaryField || this.sortFieldName), sortSuffix],
    [this.idField, sortSuffix]
  ];
};


Sort.prototype.getMongoEqualOffsetQuery = function () {
  var query = {};
  query[this.sortFieldName] = this.offsetPrimaryField;
  return query;
};


Sort.prototype.getMongoGreaterThanOffsetQuery = function () {
  var query = {};
  query[this.sortFieldName] = { $gt: this.offsetPrimaryField };
  return query;
};


Sort.prototype.getMongoLessThanOffsetQuery = function () {
  var query = {};
  query[this.sortFieldName] = { $lt: this.offsetPrimaryField };
  return query;
};


var ISODateRegexPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.{0,4}Z$/;

function getOffsetValue (query) {

  if(ISODateRegexPattern.test(query.offset_date)) return query.offset_date;

  var value = parseInt(query.offset_sort, 10);
  if (!isNaN(value)) return value;

  return query.offset_sort;
}
