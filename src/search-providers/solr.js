import SearchProvider from './search-provider';

export default class SolrSearchProvider extends SearchProvider {
  constructor(opt) {
    super(opt);
  }

  getSortQuery(primaryField) {
    const field = primaryField || this.sortFieldColumn;
    const sortDirection = this.isAscQuerySort ? 'asc' : 'desc';
    return `${field} ${sortDirection}, ${this.idFieldColumn} ${sortDirection}`;
  }

  addPagingQuery(solrQuery) {
    if (!this.hasParametersToFilter()) return;

    if (this.isAscQuerySort) {
      solrQuery
        .begin()
          .where(this.sortFieldColumn).gt(this.offsetPrimaryField)
          .or()
          .begin()
            .where(this.sortFieldColumn).equals(this.offsetPrimaryField)
            .where(this.idFieldColumn).gt(this.query.offset_id)
          .end()
        .end();
    } else {
      solrQuery
        .begin()
          .where(this.sortFieldColumn).lt(this.offsetPrimaryField)
          .or()
          .begin()
            .where(this.sortFieldColumn).equals(this.offsetPrimaryField)
            .where(this.idFieldColumn).lt(this.query.offset_id)
          .end()
        .end();
    }
    solrQuery.where(this.idFieldColumn, this.query.offset_id, { not: true });
  }
}
