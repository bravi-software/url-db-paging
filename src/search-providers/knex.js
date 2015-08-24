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
}
