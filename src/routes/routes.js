const Router = require('koa-router');
const getSeries = require('../controller/getSeries.controller');
const upsertSeries = require('../controller/upsertSeries.controller');
const schema = require("../schema/series.schema");
const validate = require('../middleware/validate');
const series = new Router();

series.get('/series', validate(schema.IGetSeries), async (ctx) => {
  const { client, db } = await require('../mongodb');
  const collection = db.collection('monthly_series');
  const data = await getSeries(collection, ctx);
  ctx.body = {
    data: data
  };
}).post('/series',  validate(schema.IUpsertSeries), async (ctx) => {
  const { client, db } = await require('../mongodb');
  const collection = db.collection('monthly_series');
  const data = await upsertSeries(collection, ctx);
  ctx.body = {
    data: data
  };
});

module.exports = series;