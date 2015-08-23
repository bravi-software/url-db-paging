
var FakeQueryBuilder = module.exports = function (data) {
  this.data = data;
  this.isAscQuerySort = true;
};

FakeQueryBuilder.prototype.search = function (limit) {
  var that = this,
      result = [];

  var sortData = that.isAscQuerySort ? sortAsc : sortDesc;
  sortData(that.data, function (item) {
    if (result.length < limit && that.where(item)) result.push(item);
  });

  return result;
};

FakeQueryBuilder.prototype.setQuery = function (query) {
  this.where = query;
};

FakeQueryBuilder.prototype.setSort = function (isAsc) {
  this.isAscQuerySort = isAsc;
};

FakeQueryBuilder.prototype.where = function () {
  return true;
};

function sortAsc (data, cb) {
  for (var i = 0; i < data.length; i++) {
    cb(data[i]);
  }
}

function sortDesc (data, cb) {
  for (var i = data.length-1; i >= 0; i--) {
    cb(data[i]);
  }
}

/*
 * Monkey patch original behavior to allow test it without depend of any database
 */
var Sort = require('../lib/sort');
Sort.prototype.addPagingMongoQuery =
Sort.prototype.addPagingSolrQuery = function(dbQuery) {
  var that = this;
  if (!that.hasParametersToFilter()) return;
  dbQuery.setSort(that.isAscQuerySort);
  dbQuery.setQuery(function (item) {
    if (item._id === parseInt(that.query.offset_id)) return false;
    if (that.isAscQuerySort) {
      if (item[that.sortFieldName] > new Date(that.query.offset_date)) return true;
      if (item[that.sortFieldName] === new Date(that.query.offset_date) && item._id > parseInt(that.query.offset_id)) return true;
    } else {
      if (item[that.sortFieldName] < new Date(that.query.offset_date)) return true;
      if (item[that.sortFieldName] === new Date(that.query.offset_date) && item._id < parseInt(that.query.offset_id)) return true;
    }
  });
};
