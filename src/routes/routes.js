const Router = require('koa-router');
const getSeries = require('../business/getSeries.business');
const upsertSeries = require('../business/upsertSeries.business');
const schema = require("../schema/series.schema");
const validate = require('../middleware/validate');
const series = new Router();

series.get('/series', validate(schema.IGetSeries), async (ctx) => {
  const data = await getSeries(ctx);
  ctx.body = {
    data: data
  };
}).post('/series',  validate(schema.IUpsertSeries), async (ctx) => {
  const data = await upsertSeries(ctx);
  ctx.body = {
    data: data
  };
});

module.exports = series;