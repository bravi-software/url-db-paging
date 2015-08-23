require('./spec-helper');

var expect = require('chai').expect,
    RestUtils = require('../').RestUtils;

/* jshint -W030 */
describe('Paging .addSelfLink', function() {
  var item = {},
      rootUrl = 'http://service/';

  it('should add a self link', function() {
    RestUtils.addSelfLink(item, '_id', rootUrl);
    expect(item).to.have.property('_links');
  });
});
