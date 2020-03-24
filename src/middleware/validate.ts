import Joi, { ObjectSchema } from "@hapi/joi";

export default (schema: ObjectSchema) => async (ctx, next) => {
  const { query, method, body } = ctx.request;
  const payload = method === 'GET' ? query : body;

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
    await next();
  }
}