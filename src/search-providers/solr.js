import SearchProvider from './search-provider';

export default class SolrSearchProvider extends SearchProvider {
  constructor(opt) {
    super(opt);
  }

  getSortQuery(primaryField) {
    const field = primaryField || this.sortFieldName;
    const sortDirection = this.isAscQuerySort ? 'asc' : 'desc';
    return `${field} ${sortDirection}, ${this.idField} ${sortDirection}`;
  }

  addPagingQuery(solrQuery) {
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
}
