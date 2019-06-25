import Router from 'koa-router';
import getSeries from '../business/getSeries.business.js';
import upsertSeries from '../business/upsertSeries.business.js';
import { IGetSeries, IUpsertSeries } from "../schema/series.schema.js";
import Validate from '../middleware/validate.js';
const series = new Router();

series.get('/series', Validate(IGetSeries), async (ctx) => {
  const data = await getSeries(ctx);
  ctx.body = {
    data: data
  };
}).post('/series',  Validate(IUpsertSeries), async (ctx) => {
  const data = await upsertSeries(ctx);
  ctx.body = {
    data: data
  };
});

export default series;