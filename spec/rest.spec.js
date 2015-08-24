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
});
