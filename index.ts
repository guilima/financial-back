import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import routes from './src/routes/routes';
import schemaValidator from '@middleware/validate';
import errorHandler from '@middleware/errorHandler';
import { appCors, port } from './config';

const app = new Koa();
app.use(bodyParser())
  .use(cors({
    origin: appCors,
    allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true
  }))
  .use(schemaValidator)
  .use(errorHandler)
  .use(routes.routes())
  .use(routes.allowedMethods())
  .on('error', (err, ctx) => {
    console.log(err);
  });

const server = app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

export default server;