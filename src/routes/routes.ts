import Router from '@koa/router';
import getSeries from '@business/getSeries.business';
import upsertSeries from '@business/upsertSeries.business';
import jwt from '@middleware/jwt';
import authRenewer from '@middleware/authRenewer';
import { DefaultState, Context } from 'koa';
const routes = new Router<DefaultState, Context>();
routes
  .get('/series', getSeries)
  .post('/series', jwt, authRenewer, upsertSeries);

export default routes;