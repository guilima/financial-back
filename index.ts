import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import routes from './src/routes/routes';
import { port } from './config';

const app = new Koa();
app.use(bodyParser())
  .use(routes.routes())
  .use(routes.allowedMethods());

const server = app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

export default server;