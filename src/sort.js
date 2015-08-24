import util from 'util';


const ISODateRegexPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.{0,4}Z$/;
const DIRECTION = {
  FORWARD: 'forward',
  BACKWARD: 'backward',
};

export default class Sort {
  constructor(opt) {
    this.query = opt.query;
    this.sortField = opt.query.sort || opt.defaultSortField;
    this.isSortDesc = /^-/.test(this.sortField);
    this.isForwardPagging = opt.query.dir !== DIRECTION.BACKWARD;
    this.isAscQuerySort = (!this.isSortDesc && this.isForwardPagging) || (this.isSortDesc && !this.isForwardPagging);
    this.sortFieldName = this.sortField.replace(/^-/, '');
    this.offsetPrimaryField = getOffsetValue(this.query);
    this.idField = opt.idField;
  }

  hasParametersToFilter() {
    return this.offsetPrimaryField && this.query.offset_id;
  }


  addPagingMongoQuery(dbQuery) {
    const sortFilter = this.buildPagingMongoQuery();

    dbQuery.and(sortFilter);
  }


  buildPagingMongoQuery() {
    const sortFilter = {};
    if (!this.hasParametersToFilter()) return sortFilter;

    const offsetAndIdQuery = this.buildOffsetAndIdQuery();

    if (this.isAscQuerySort) {
      const greaterThanOffsetDate = this.getMongoGreaterThanOffsetQuery();

      sortFilter.$or = [
        greaterThanOffsetDate,
        offsetAndIdQuery,
      ];
    } else {
      const lessThanOffsetDate = this.getMongoLessThanOffsetQuery();

      sortFilter.$or = [
        lessThanOffsetDate,
        offsetAndIdQuery,
      ];
    }

    sortFilter[this.idField] = { $ne: this.query.offset_id };

    return sortFilter;
  }


  buildOffsetAndIdQuery() {
    const equalOffsetDate = this.getMongoEqualOffsetQuery();

    const andId = {};

    if (this.isAscQuerySort) {
      andId[this.idField] = { $gt: this.query.offset_id };
    } else {
      andId[this.idField] = { $lt: this.query.offset_id };
    }

    return { $and: [ equalOffsetDate, andId ] };
  }


  addPagingSolrQuery(solrQuery) {
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
  }


  addPagingKnexQuery(knex) {
    if (!this.hasParametersToFilter()) return;
    const that = this;

    if (this.isAscQuerySort) {
      knex
        .where(this.sortFieldName, '>', this.offsetPrimaryField)
        .orWhere(function where() {
          this.where(that.sortFieldName, that.offsetPrimaryField)
              .where(that.idField, '>', that.query.offset_id);
        });
    } else {
      knex
        .where(this.sortFieldName, '<', this.offsetPrimaryField)
        .orWhere(function where() {
          this.where(that.sortFieldName, that.offsetPrimaryField)
              .where(that.idField, '<', that.query.offset_id);
        });
    }
    knex.where(this.idField, '<>', this.query.offset_id);
  }


  getSortMongoQuery(primaryField) {
    const sortPrefix = this.isAscQuerySort ? '' : '-';
    return util.format('%s%s %s%s', sortPrefix, (primaryField || this.sortFieldName), sortPrefix, this.idField);
  }


  getSortSolrQuery(primaryField) {
    const sortSuffix = this.isAscQuerySort ? 'asc' : 'desc';
    return util.format('%s %s, %s %s', (primaryField || this.sortFieldName), sortSuffix, this.idField, sortSuffix);
  }


  getSortKnexQuery(primaryField) {
    const sortSuffix = this.isAscQuerySort ? 'asc' : 'desc';
    return util.format('%s %s, %s %s', (primaryField || this.sortFieldName), sortSuffix, this.idField, sortSuffix);
  }


  getMongoEqualOffsetQuery() {
    const query = {};
    query[this.sortFieldName] = this.offsetPrimaryField;
    return query;
  }


  getMongoGreaterThanOffsetQuery() {
    const query = {};
    query[this.sortFieldName] = { $gt: this.offsetPrimaryField };
    return query;
  }


  getMongoLessThanOffsetQuery() {
    const query = {};
    query[this.sortFieldName] = { $lt: this.offsetPrimaryField };
    return query;
  }
}


function getOffsetValue(query) {
  if (ISODateRegexPattern.test(query.offset_date)) return query.offset_date;

  const value = parseInt(query.offset_sort, 10);
  if (!isNaN(value)) return value;

  return query.offset_sort;
}
