import Joi, { ObjectSchema } from "@hapi/joi";
import { routeSchemas } from "@schema/series.schema";
import { Context, Next, Middleware } from "koa";

export default async (ctx: Context, next: Next): Promise<Middleware> => {
  const { query, method, body } = ctx.request;
  const payload = method === 'GET' ? query : body;
  const schemas: Map<string, ObjectSchema> = new Map(routeSchemas[method.toLocaleLowerCase()]);
  const schema = schemas.get(ctx.path);

  const { error, value } = Joi.validate(payload, schema);

  if (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
      data: error.details[0]
    };
  } else {
    ctx.request.body = value;
    return await next();
  }
}