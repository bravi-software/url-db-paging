import Sort from '../src/sort';


export default class FakeQueryBuilder {
  constructor(data) {
    this.data = data;
    this.isAscQuerySort = true;
  }

  search(limit) {
    const result = [];
    const  sortData = this.isAscQuerySort ? sortAsc : sortDesc;

    sortData(this.data, item => {
      if (result.length < limit && this.where(item)) result.push(item);
    });

    return result;
  }

  setQuery(query) {
    this.where = query;
  }

  setSort(isAsc) {
    this.isAscQuerySort = isAsc;
  }

  where() {
    return true;
  }
}

function sortAsc(data, cb) {
  for (let i = 0; i < data.length; i++) {
    cb(data[i]);
  }
}

function sortDesc(data, cb) {
  for (let i = data.length - 1; i >= 0; i--) {
    cb(data[i]);
  }
}

/*
 * Monkey patch original behavior to allow test it without depend on any database
 */
Sort.prototype.addPagingMongoQuery =
Sort.prototype.addPagingSolrQuery = function onPaging(dbQuery) {
  if (!this.hasParametersToFilter()) return;

  dbQuery.setSort(this.isAscQuerySort);

  dbQuery.setQuery(item => {
    if (item._id === parseInt(this.query.offset_id, 10)) return false;
    if (this.isAscQuerySort) {
      if (item[this.sortFieldName] > new Date(this.query.offset_date)) return true;
      if (item[this.sortFieldName] === new Date(this.query.offset_date) && item._id > parseInt(this.query.offset_id, 10)) return true;
    } else {
      if (item[this.sortFieldName] < new Date(this.query.offset_date)) return true;
      if (item[this.sortFieldName] === new Date(this.query.offset_date) && item._id < parseInt(this.query.offset_id, 10)) return true;
    }
  });
};
