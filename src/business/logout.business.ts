import { Context } from "koa";

export default async (ctx: Context) => {
  ctx.cookies.set('tokenAccess');
  return ctx.body = { data: undefined };
}
