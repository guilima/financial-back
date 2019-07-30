import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import routes from './src/routes/routes';
import { port } from './config';

const app = new Koa();
app.use(bodyParser())
  .use(cors({
    origin: 'https://guilima.github.io',
    allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true
  }))
  .use(routes.routes())
  .use(routes.allowedMethods());

const server = app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

export default server;