import SearchProvider from './search-provider';

export default class KnexSearchProvider extends SearchProvider {
  constructor(opt) {
    super(opt);
  }

  getSortQuery(primaryField) {
    const field = primaryField || this.sortFieldName;
    const sortDirection = this.isAscQuerySort ? 'asc' : 'desc';
    return `${field} ${sortDirection}, ${this.idField} ${sortDirection}`;
  }

  addPagingQuery(knex) {
    if (!this.hasParametersToFilter()) {
      return;
    }

    const that = this;
    let operator = '>';

    if (!this.isAscQuerySort) {
      operator = '<';
    }

    knex
      .where(this.sortFieldName, operator, this.offsetPrimaryField)
      .orWhere(function where() {
        this.where(that.sortFieldName, that.offsetPrimaryField)
            .where(that.idField, operator, that.query.offset_id);
      })
      .where(this.idField, '<>', this.query.offset_id);
  }
}
