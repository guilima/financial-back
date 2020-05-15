import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import router from './src/routes/index';
import session from 'koa-session';
import redisStore from 'koa-redis';
import errorHandler from '@middleware/errorHandler';
import { appCors, port, cookieKeys, redisURI } from './config';

const app = new Koa();
app.keys = cookieKeys;
app.use(session({
  maxAge: 5184000000,
  sameSite: "none",
  store: redisStore({url: redisURI})
}, app));
app.proxy = true;
app.use(bodyParser())
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