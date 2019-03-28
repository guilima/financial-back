const Router = require('koa-router');
const router = new Router();
const getSeries = require('../controller/getSeries.controller');
const upsertSeries = require('../controller/upsertSeries.controller');

router.get('/series', async (ctx) => {
  const { client, db } = await require('../mongodb');
  const collection = db.collection('monthly-series');
  const data = await getSeries(collection, ctx);
  ctx.body = {
    status: data.isJoi ? 'error' : 'success',
    data: data
  };
}).post('/series', async (ctx) => {
  const { client, db } = await require('../mongodb');
  const collection = db.collection('monthly-series');
  const data = await upsertSeries(collection, ctx);
  ctx.body = {
    status: data.isJoi ? 'error' : 'success',
    data: data.result || data
  };
});

module.exports = router;