import { Context } from "koa";

export default async (ctx: Context) => {
  return ctx.body = { data: undefined };
}
