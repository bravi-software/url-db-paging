# url-db-paging

[![Build Status](https://travis-ci.org/bravi-software/url-db-paging.svg?branch=master)](https://travis-ci.org/bravi-software/url-db-paging)
[![npm version](https://badge.fury.io/js/url-db-paging.svg)](http://badge.fury.io/js/url-db-paging)

A library to help creating paging results.

## Features

- Build a paging query database based in the given url. Which will use a offset search due performance reasons.
- Build REST JSON output with link to the next and previous pages.

## Support for these search providers

- [MongoDB](https://www.mongodb.org/) through [Mongoose](http://mongoosejs.com/)
- [MySQL](https://www.mysql.com/) and [PostgreSQL](http://www.postgresql.org/) through [Knex](http://knexjs.org/)
- [Solr](http://lucene.apache.org/solr/) through [solr-query-builder](https://github.com/maxcnunes/solr-query-builder)

*Do you want another provider? Please open an issue or even better send us a pull request.*

## Usage

### Options

- `query`: request query string
- `defaultSortField`: default primary sort field
- `idField`: data's id field
- `root`: base url
- `limit`: limit results per page
- `queryBuilderType`: query builder type (mongoose, solr or knex)

```js
var express = require('express'),
    Paging = require('url-db-paging'),
    User = require('./models/user');

var app = express();

app.get('/', function(req, res, next){
  var userQuery = User.find();

  var limit = parseInt(query.limit, 10) || 20;

  var paging = new Paging({
    query: req.query,               // query string
    defaultSortField: '-created',   // default sort field
    idField: '_id',                 // data's id field
    root: 'http://service/users',   // base url
    limit: limit,                   // limit per page
    queryBuilderType: 'mongoose'    // query builder type
  });

  // add sort db query
  paging.addSortDbQuery(userQuery);

  userQuery
    .sort(paging.getSortQuery())    // sort using paging
    .limit(paging.getLimitQuery())  // limit using paging
    .exec()
    .then(result, next);

  function result(users) {
    var data = paging.buildPagingResult(users); // add paging into data result
    return res.status(200).send(data);
  }
});


module.exports = app;
```

### Output Result (Example)

```js
{
  list:[
    { ... },
    { ... },
    { ... }
  ],
  _links: {
    previous: {
      href: "http://service/users?limit=5&sort=-created&offset_date=2014-07-31T12%3A05%3A24.865Z&offset_id=53da3104d14bdb2500cc203d&dir=backward"
    },
    next: {
      href: "http://service/users?limit=5&sort=-created&offset_date=2014-07-31T12%3A05%3A24.854Z&offset_id=53da3104d14bdb2500cc2035&dir=forward"
    }
  }
}
```

## Contributing

It is required to use [editorconfig](http://editorconfig.org/) and please write and run specs before pushing any changes:

```js
npm test
```
