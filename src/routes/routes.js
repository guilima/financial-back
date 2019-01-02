const Router = require('koa-router');
const router = new Router();
const getSeries = require('../controller/getSeries.controller');
const upsertSeries = require('../controller/upsertSeries.controller');

router.get('/series', async (ctx) => {
  const { client, db } = await require('../mongodb');
  const documentInvetory2 = db.collection('inventory2');
  const data = await getSeries(documentInvetory2, ctx);
  ctx.body = {
    status: data.isJoi ? 'error' : 'success',
    data: data
  };
}).post('/series', async (ctx) => {
  const { client, db } = await require('../mongodb');
  const documentInvetory2 = db.collection('inventory2');
  const data = await upsertSeries(documentInvetory2, ctx);
  ctx.body = {
    status: data.isJoi ? 'error' : 'success',
    data: data.result || data
  };
});

module.exports = router;