const Koa = require('koa');
var bodyParser = require('koa-bodyparser');
const indexRoutes = require('./src/routes/routes');

const app = new Koa();
const PORT = process.env.PORT || 1337;
app.use(bodyParser());
app.use(indexRoutes.routes());

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;