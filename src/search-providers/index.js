import KnexSearchProvider from './knex';
import MongooseSearchProvider from './mongoose';
import SolrSearchProvider from './solr';


export default {
  mongoose: MongooseSearchProvider,
  knex: KnexSearchProvider,
  solr: SolrSearchProvider,
};
