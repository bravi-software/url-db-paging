import SearchProvider from './search-provider';

export default class MongooseSearchProvider extends SearchProvider {
  constructor(opt) {
    super(opt);
  }

  getSortQuery(primaryField) {
    const field = primaryField || this.sortFieldColumn;
    const sortDirection = this.isAscQuerySort ? '' : '-';

    return `${sortDirection}${field} ${sortDirection}${this.idFieldColumn}`;
  }

  addPagingQuery(dbQuery) {
    const sortFilter = this._buildPagingQuery();

    dbQuery.and(sortFilter);
  }

  _buildPagingQuery() {
    const sortFilter = {};
    if (!this.hasParametersToFilter()) return sortFilter;

    const offsetAndIdQuery = this._buildOffsetAndIdQuery();

    if (this.isAscQuerySort) {
      const greaterThanOffsetDate = this._getQueryGreaterThanOffset();

      sortFilter.$or = [
        greaterThanOffsetDate,
        offsetAndIdQuery,
      ];
    } else {
      const lessThanOffsetDate = this._getQueryLessThanOffset();

      sortFilter.$or = [
        lessThanOffsetDate,
        offsetAndIdQuery,
      ];
    }

    sortFilter[this.idFieldColumn] = { $ne: this.query.offset_id };

    return sortFilter;
  }

  _buildOffsetAndIdQuery() {
    const equalOffsetDate = this._getQueryEqualOffset();

    const andId = {};

    if (this.isAscQuerySort) {
      andId[this.idFieldColumn] = { $gt: this.query.offset_id };
    } else {
      andId[this.idFieldColumn] = { $lt: this.query.offset_id };
    }

    return { $and: [ equalOffsetDate, andId ] };
  }


  _getQueryEqualOffset() {
    const query = {};
    query[this.sortFieldColumn] = this.offsetPrimaryField;
    return query;
  }

  _getQueryGreaterThanOffset() {
    const query = {};
    query[this.sortFieldColumn] = { $gt: this.offsetPrimaryField };
    return query;
  }

  _getQueryLessThanOffset() {
    const query = {};
    query[this.sortFieldColumn] = { $lt: this.offsetPrimaryField };
    return query;
  }
}
