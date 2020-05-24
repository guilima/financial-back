import { Context, Next, Middleware } from "koa";

export default async (ctx: Context, next: Next): Promise<Middleware> => {
  try {
    return await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: {
        status: ctx.status,
        type: err.name,
        message: err.message,
        details: err.details || [].concat(err.detail || [])
      }
    }
    ctx.app.emit('error', err, ctx);
  }
};