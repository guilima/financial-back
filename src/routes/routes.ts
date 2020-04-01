import Router from 'koa-router';
import getSeries from '@business/getSeries.business';
import upsertSeries from '@business/upsertSeries.business';
import jwt from '@middleware/jwt';
const routes = new Router();

routes.get('/series', async (ctx) => {
  const data = await getSeries(ctx);
  ctx.body = {
    data: data
  };
}).post('/series', jwt, async (ctx) => {
  const data = await upsertSeries(ctx);
  ctx.body = {
    data: data
  };
});

export default routes;