import { datePaged, addSelfLink } from './rest';
import searchProviders from './search-providers';


export default class Paging {
  constructor(opt) {
    this.opt = opt;

    const SearchProvider = searchProviders[opt.queryBuilderType];
    if (!SearchProvider) {
      throw new Error(`Invalid query builder type: ${opt.queryBuilderType}.`);
    }

    this.searchProvider = new SearchProvider(opt);
    this.opt.sortFieldName = this.searchProvider.sortFieldName;

    if (opt.defaultSortField && opt.defaultSortField.json) {
      this.opt.sortFieldName = opt.defaultSortField.json;
    }
  }


  addSortDbQuery(queryBuilder) {
    this.searchProvider.addPagingQuery(queryBuilder);
  }


  buildPagingResult(data) {
    const dataResult = Array.isArray(data) ? data : [];

    this.opt.data = { list: dataResult };

    if (!this.opt.data.list.length) return this.opt.data;

    if (!this.searchProvider.isForwardPagging) this.opt.data.list.reverse();

    datePaged(this.opt);

    return this.opt.data;
  }


  getSortQuery(primaryField) {
    return this.searchProvider.getSortQuery(primaryField);
  }


  getLimitQuery() {
    // use limit + 1 due paging
    return this.opt.limit + 1;
  }


  addSelfLink(data, id, root) {
    const _id = id || this.opt.idField;
    const _root = root || this.opt.root;

    addSelfLink(data, _id, _root);
  }


  addSelfLinkInAllItems(data, id, root) {
    const _id = id || this.opt.idField;
    const _root = root || this.opt.root;

    data.list.forEach(item => addSelfLink(item, _id, _root));
  }
}
