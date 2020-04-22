import { Context } from "koa";
import JwToken from '@utils/jwt.utils';

const jwToken = new JwToken();

export default async (ctx: Context) => {
  ctx.cookies.set('tokenAccess');
  if (ctx.session.tokenRefresh) {
    const redisClient = ctx.session._sessCtx.store.client;
    await redisClient.zadd('blacklist', (jwToken.decode(ctx.session.tokenRefresh).exp * 1000), ctx.session.tokenRefresh);
    await redisClient.zremrangebyscore('blacklist', '-inf', Date.now());
    delete ctx.session.tokenRefresh;
  }
  return ctx.body = { data: undefined };
}
