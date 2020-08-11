import Router from '@koa/router';
import getSeries from '@business/getSeries.business';
import upsertSeries from '@business/upsertSeries.business';
import jwt from '@middleware/authValidator';
import authRenewer from '@middleware/authRenewer';
import { DefaultState, Context } from 'koa';
import schemaValidator from '@middleware/schemaValidator';
const routes = new Router<DefaultState, Context>();
routes
  .get('/series', schemaValidator, getSeries)
  .post('/series', schemaValidator, jwt, authRenewer, upsertSeries);

export default routes;