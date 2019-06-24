const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const series = require('./src/routes/routes');
const { port } = require('./config');

const app = new Koa();
app.use(bodyParser());
app.use(series.routes());

const server = app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

module.exports = server;