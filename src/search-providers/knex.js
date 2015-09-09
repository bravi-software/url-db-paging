import SearchProvider from './search-provider';

export default class KnexSearchProvider extends SearchProvider {
  constructor(opt) {
    super(opt);
  }

  getSortQuery(primaryField) {
    const field = primaryField || this.sortFieldColumn;
    const sortDirection = this.isAscQuerySort ? 'asc' : 'desc';

    return [
      [field, sortDirection],
      [this.idFieldColumn, sortDirection],
    ];
  }

  addPagingQuery(knex) {
    if (!this.hasParametersToFilter()) {
      return;
    }

    let operator = '>';

    if (!this.isAscQuerySort) {
      operator = '<';
    }

    knex
      .where(this.sortFieldColumn, operator, this.offsetPrimaryField)
      .where(this.idFieldColumn, '<>', this.query.offset_id)
      .orWhere((query) => {
        query.where(this.sortFieldColumn, this.offsetPrimaryField);
        query.where(this.idFieldColumn, operator, this.query.offset_id);
      });
  }
}
