import Sort from './sort';
import { datePaged, addSelfLink } from './rest';


const VALID_DB_QUERY_TYPE = ['mongoose', 'solr', 'knex'];


export default class Paging {
  constructor(opt) {
    this.sort = new Sort(opt);
    this.opt = opt;

    this.opt.sortFieldName = this.sort.sortFieldName;

    if (this.opt.queryBuilderType) validateQueryBuilderType(this.opt.queryBuilderType);
  }


  addSortDbQuery(queryBuilder, type) {
    const queryBuilderType = type || this.opt.queryBuilderType;
    validateQueryBuilderType(queryBuilderType);

    if (queryBuilderType === 'mongoose') this.sort.addPagingMongoQuery(queryBuilder);
    if (queryBuilderType === 'solr') this.sort.addPagingSolrQuery(queryBuilder);
    if (queryBuilderType === 'knex') this.sort.addPagingKnexQuery(queryBuilder);
  }


  buildPagingResult(data) {
    const dataResult = Array.isArray(data) ? data : [];

    this.opt.data = { list: dataResult };

    if (!this.opt.data.list.length) return this.opt.data;

    if (!this.sort.isForwardPagging) this.opt.data.list.reverse();
    datePaged(this.opt);

    return this.opt.data;
  }


  getSortQuery(type, primaryField) {
    const queryBuilderType = type || this.opt.queryBuilderType;
    validateQueryBuilderType(queryBuilderType);

    if (queryBuilderType === 'mongoose') return this.sort.getSortMongoQuery(primaryField);
    if (queryBuilderType === 'solr') return this.sort.getSortSolrQuery(primaryField);
    if (queryBuilderType === 'knex') return this.sort.getSortKnexQuery(primaryField);
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


function validateQueryBuilderType(type) {
  if (!~VALID_DB_QUERY_TYPE.indexOf(type)) throw new Error(`Invalid query builder type: ${type}.`);
}
