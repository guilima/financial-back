export default async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = {
      error: {
        status: ctx.status,
        type: err.name,
        message: err.message,
        details: err.details
      }
    }
    ctx.app.emit('error', err, ctx);
  }
};