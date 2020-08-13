import { ObjectSchema } from "@hapi/joi";
import { routeSchemas } from "@schema/series.schema";
import { Context, Next, Middleware } from "koa";

export default async (ctx: Context, next: Next): Promise<Middleware> => {
  const { query, method, body } = ctx.request;
  const payload = method === 'GET' ? query : body;
  const schemas: Map<string, ObjectSchema> = new Map(routeSchemas[method.toLocaleLowerCase()]);
  const schema = schemas.get(ctx._matchedRoute);

  const { error, value } = schema.validate(payload);

  if (error) {
    ctx.assert(error.isJoi, 422, error.message);

    ctx.throw(400, error.message.replace(/['"]/g, ''), { details: error.details.map(({message, type}) => ({
      message: message.replace(/['"]/g, ''),
      type
    }))});
  }

  ctx.request.body = value;
  return await next();
}