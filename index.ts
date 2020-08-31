import Koa from 'koa';
import bodyParser from 'koa-body';
import cors from '@koa/cors';
import router from './src/routes/index';
import session from 'koa-session';
import errorHandler from './src/middleware/errorHandler';
import { appCors, port, cookieKeys } from './config';
import { redisStore } from './db';

const app = new Koa();
app.keys = cookieKeys;
app.use(session({
  maxAge: 5184000000,
  sameSite: "none",
  store: redisStore
}, app));
app.proxy = true;
app.use(bodyParser({multipart: true, urlencoded: true}))
  .use(cors({
    origin: appCors,
    allowHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
    credentials: true
  }))
  .use(errorHandler)
  .use(router.routes())
  .use(router.allowedMethods())
  .on('error', (err, ctx) => {
    console.log(err);
  });

const server = app.listen(port, () => {
  console.log(`Server listening on port: ${port}`);
});

export default server;