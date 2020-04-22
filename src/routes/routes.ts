import Router from '@koa/router';
import getSeries from '@business/getSeries.business';
import schemaValidator from '@middleware/validate';
import upsertSeries from '@business/upsertSeries.business';
import jwt from '@middleware/jwt';
const routes = new Router();

routes
  .use(schemaValidator)
  .get('/series', getSeries)
  .post('/series', jwt, upsertSeries);

export default routes;