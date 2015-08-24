/* eslint func-names:0 */
import './spec-helper';
import { expect } from 'chai';
import qs from 'querystring';
import FakeQueryBuilder from './fake-query-builder';
import Paging from '../src';
import data from './fixtures';


const rootUrl = 'http://service/';


function getResultPagingWithFakeDbQuery(query) {
  const queryBuilder = new FakeQueryBuilder(data);

  const paging = new Paging({
    query: query,
    defaultSortField: 'publishedAt',
    idField: '_id',
    root: rootUrl,
    limit: parseInt(query.limit, 10) || 10,
    queryBuilderType: 'mongoose',
  });

  paging.addSortDbQuery(queryBuilder);

  const dbResult = queryBuilder.search(paging.getLimitQuery());
  return paging.buildPagingResult(dbResult);
}

describe('Paging .buildPagingResult', function() {
  describe('limit is 20 and there are 50 items in the database', function() {
    describe('going forward', function() {
      describe('first page', function() {
        let result = [];
        beforeEach(function() {
          result = getResultPagingWithFakeDbQuery({ limit: 20 });
        });

        it('should return 20 items', function() {
          expect(result.list).to.have.length.of.at.least(20);
        });

        it('should have first item with id equals 1', function() {
          expect(result.list[0]._id).to.be.equal(1);
        });

        it('should have last item with id equals 20', function() {
          expect(result.list[19]._id).to.be.equal(20);
        });

        it('should not have a link to the previous page', function() {
          expect(result._links).to.not.have.property('previous');
        });

        it('should have a valid link to the next page', function() {
          expect(result._links.next.href).to.be.equal(rootUrl + '?limit=20&offset_date=2000-03-01T04%3A01%3A20.000Z&offset_id=20&dir=forward');
        });
      });

      describe('second page', function() {
        let result = [];
        beforeEach(function() {
          result = getResultPagingWithFakeDbQuery(qs.parse('limit=20&offset_date=2000-03-01T04%3A01%3A20.000Z&offset_id=20&dir=forward'));
        });

        it('should return 20 items', function() {
          expect(result.list).to.have.length.of.at.least(20);
        });

        it('should have first item with id equals 21', function() {
          expect(result.list[0]._id).to.be.equal(21);
        });

        it('should have last item with id equals 40', function() {
          expect(result.list[19]._id).to.be.equal(40);
        });

        it('should have a valid link to the next page', function() {
          expect(result._links.next.href).to.be.equal(rootUrl + '?limit=20&offset_date=2000-03-01T04%3A01%3A40.000Z&offset_id=40&dir=forward');
        });

        it('should have a valid link to the previous page', function() {
          expect(result._links.previous.href).to.be.equal(rootUrl + '?limit=20&offset_date=2000-03-01T04%3A01%3A21.000Z&offset_id=21&dir=backward');
        });
      });

      describe('third page', function() {
        let result = [];
        beforeEach(function() {
          result = getResultPagingWithFakeDbQuery(qs.parse('limit=20&offset_date=2000-03-01T04%3A01%3A40.000Z&offset_id=40&dir=forward'));
        });

        it('should return 10 items', function() {
          expect(result.list).to.have.length.of.at.least(10);
        });

        it('should have first item with id equals 41', function() {
          expect(result.list[0]._id).to.be.equal(41);
        });

        it('should have last item with id equals 50', function() {
          expect(result.list[9]._id).to.be.equal(50);
        });

        it('should not have a link to the next page', function() {
          expect(result._links).to.not.have.property('next');
        });

        it('should have a valid link to the previous page', function() {
          expect(result._links.previous.href).to.be.equal(rootUrl + '?limit=20&offset_date=2000-03-01T04%3A01%3A41.000Z&offset_id=41&dir=backward');
        });
      });
    });

    describe('going backward', function() {
      describe('second page', function() {
        let result = [];
        beforeEach(function() {
          result = getResultPagingWithFakeDbQuery(qs.parse('limit=20&offset_date=2000-03-01T04%3A01%3A41.000Z&offset_id=41&dir=backward'));
        });

        it('should return 20 items', function() {
          expect(result.list).to.have.length.of.at.least(20);
        });

        it('should have first item with id equals 21', function() {
          expect(result.list[0]._id).to.be.equal(21);
        });

        it('should have last item with id equals 40', function() {
          expect(result.list[19]._id).to.be.equal(40);
        });

        it('should have a valid link to the next page', function() {
          expect(result._links.next.href).to.be.equal(rootUrl + '?limit=20&offset_date=2000-03-01T04%3A01%3A40.000Z&offset_id=40&dir=forward');
        });

        it('should have a valid link to the previous page', function() {
          expect(result._links.previous.href).to.be.equal(rootUrl + '?limit=20&offset_date=2000-03-01T04%3A01%3A21.000Z&offset_id=21&dir=backward');
        });
      });

      describe('first page', function() {
        let result = [];
        beforeEach(function() {
          result = getResultPagingWithFakeDbQuery(qs.parse('limit=20&offset_date=2000-03-01T04%3A01%3A21.000Z&offset_id=21&dir=backward'));
        });

        it('should return 20 items', function() {
          expect(result.list).to.have.length.of.at.least(20);
        });

        it('should have first item with id equals 1', function() {
          expect(result.list[0]._id).to.be.equal(1);
        });

        it('should have last item with id equals 20', function() {
          expect(result.list[19]._id).to.be.equal(20);
        });

        it('should not have a link to the previous page', function() {
          expect(result._links).to.not.have.property('previous');
        });

        it('should have a valid link to the next page', function() {
          expect(result._links.next.href).to.be.equal(rootUrl + '?limit=20&offset_date=2000-03-01T04%3A01%3A20.000Z&offset_id=20&dir=forward');
        });
      });
    });
  });
});

/* jshint -W030 */
describe('Paging with Mongoose', function() {
  let paging;
  const query = { limit: 20 };

  beforeEach(function() {
    paging = new Paging({
      query: query,
      defaultSortField: '-publishedAt',
      idField: '_id',
      root: rootUrl,
      limit: parseInt(query.limit, 10) || 10,
      queryBuilderType: 'mongoose',
    });
  });

  it('limit should be the value passed by querystring + 1', function() {
    expect(paging.getLimitQuery()).to.equal(20 + 1);
  });

  describe('.getSortQuery', function() {
    describe('no type is specified', function() {
      it('should be based on paging query type', function() {
        expect(paging.getSortQuery()).to.equal('-publishedAt -_id');
      });
    });
    describe('type specified is mongoose', function() {
      it('should be based on mongoose query builder type', function() {
        expect(paging.getSortQuery('mongoose')).to.equal('-publishedAt -_id');
      });
    });
    describe('type specified is solr', function() {
      it('should be based on solr query builder type', function() {
        expect(paging.getSortQuery('solr')).to.equal('publishedAt desc, _id desc');
      });
    });
  });
});

describe('Paging with Solr', function() {
  let paging;
  const query = { limit: 20 };

  beforeEach(function() {
    paging = new Paging({
      query: query,
      defaultSortField: '-publishedAt',
      idField: '_id',
      root: rootUrl,
      limit: parseInt(query.limit, 10) || 10,
      queryBuilderType: 'solr',
    });
  });

  it('limit should be the value passed by querystring + 1', function() {
    expect(paging.getLimitQuery()).to.equal(20 + 1);
  });

  describe('.getSortQuery', function() {
    describe('no type is specified', function() {
      it('should be based on paging query type', function() {
        expect(paging.getSortQuery()).to.equal('publishedAt desc, _id desc');
      });
    });
    describe('type specified is mongoose', function() {
      it('should be based on mongoose query builder type', function() {
        expect(paging.getSortQuery('mongoose')).to.equal('-publishedAt -_id');
      });
    });
    describe('type specified is solr', function() {
      it('should be based on solr query builder type', function() {
        expect(paging.getSortQuery('solr')).to.equal('publishedAt desc, _id desc');
      });
    });
  });
});

describe('Paging with Knex', function() {
  let paging;
  const query = { limit: 20 };

  beforeEach(function() {
    paging = new Paging({
      query: query,
      defaultSortField: '-publishedAt',
      idField: 'id',
      root: rootUrl,
      limit: parseInt(query.limit, 10) || 10,
      queryBuilderType: 'knex',
    });
  });

  it('limit should be the value passed by querystring + 1', function() {
    expect(paging.getLimitQuery()).to.equal(20 + 1);
  });

  describe('.getSortQuery', function() {
    describe('no type is specified', function() {
      it('should be based on paging query type', function() {
        expect(paging.getSortQuery()).to.equal('publishedAt desc, id desc');
      });
    });
    describe('type specified is mongoose', function() {
      it('should be based on mongoose query builder type', function() {
        expect(paging.getSortQuery('mongoose')).to.equal('-publishedAt -id');
      });
    });
    describe('type specified is knex', function() {
      it('should be based on knex query builder type', function() {
        expect(paging.getSortQuery('knex')).to.equal('publishedAt desc, id desc');
      });
    });
  });
});
