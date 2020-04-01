import Router from 'koa-router';
import getSeries from '@business/getSeries.business';
import upsertSeries from '@business/upsertSeries.business';
import jwt from '@middleware/jwt';
const routes = new Router();

routes
  .get('/series', getSeries)
  .post('/series', jwt, upsertSeries);

export default routes;