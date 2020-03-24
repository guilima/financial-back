import Router from 'koa-router';
import getSeries from '@business/getSeries.business';
import upsertSeries from '@business/upsertSeries.business';
import { IGetSeries, IUpsertSeries } from "@schema/series.schema";
import Validate from '@middleware/validate';
import jwt from '@middleware/jwt';
const routes = new Router();

routes.get('/series', Validate(IGetSeries), async (ctx) => {
  const data = await getSeries(ctx);
  ctx.body = {
    data: data
  };
}).post('/series',  Validate(IUpsertSeries), jwt, async (ctx) => {
  const data = await upsertSeries(ctx);
  ctx.body = {
    data: data
  };
});

export default routes;