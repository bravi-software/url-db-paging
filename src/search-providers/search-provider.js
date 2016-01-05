const ISODateRegexPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.{0,4}Z$/;

export const DIRECTION = {
  FORWARD: 'forward',
  BACKWARD: 'backward',
};

export default class SearchProvider {
  constructor(opt) {
    this.query = opt.query;

    this.sortField = opt.query.sort || opt.defaultSortField;
    this.sortFieldName = this.sortField.json || this.sortField;
    this.isSortDesc = /^-/.test(this.sortField.column || this.sortFieldName);
    this.isForwardPagging = opt.query.dir !== DIRECTION.BACKWARD;
    this.isAscQuerySort = (!this.isSortDesc && this.isForwardPagging) || this.isSortDesc && !this.isForwardPagging;
    this.sortFieldColumn = (this.sortField.column || this.sortFieldName).replace(/^-/, '');
    this.offsetPrimaryField = getOffsetValue(this.query);
    this.idField = opt.idField;
    this.idFieldColumn = opt.idField.column || opt.idField;
  }

  hasParametersToFilter() {
    return this.offsetPrimaryField && this.query.offset_id;
  }

  /* required public API to all providers */
  addPagingQuery() {}
  getSortQuery() {}

}


function getOffsetValue(query) {
  if (ISODateRegexPattern.test(query.offset_date)) return query.offset_date;

  const value = parseInt(query.offset_sort, 10);
  if (!isNaN(value)) return value;

  return query.offset_sort;
}
