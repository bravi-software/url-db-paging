/* eslint func-names:0 */
import './spec-helper';
import { expect } from 'chai';
import { restUtils } from '../src';

describe('Paging .addSelfLink', function() {
  const item = {};
  const rootUrl = 'http://service/';

  it('should add a self link', function() {
    restUtils.addSelfLink(item, '_id', rootUrl);
    expect(item).to.have.property('_links');
  });

  it('should build links', function() {
    const obj = {
      data: {
        list: [
          {
            id: 2,
            name: 'question',
            updatedAt: '2015-09-14T19:32:19.740Z',
          },
          {
            id: 3,
            name: 'question 2',
            updatedAt: '2015-09-14T19:32:19.740Z',
          },
        ],
      },
      defaultSortField: {
        column: '-q.updatedAt',
        json: 'updatedAt',
      },
      idField: {
        column: 'q.id',
        json: 'id',
      },
      limit: 1,
      query: {
        limit: 1,
        query: {
          termId: 1,
        },
      },
      queryBuilderType: 'knex',
      root: '/questions',
      sortFieldName: 'updatedAt',
    };

    restUtils.datePaged(obj);

    const test = /query\%5BtermId\%5D=1/.test(obj.data._links.next.href);
    expect(test).to.be.equal(true);

    expect(obj.data._links).to.have.property('self');
    expect(obj.data._links.self.href).to.be.equal('/questions?limit=1&query%5BtermId%5D=1');
  });
});
