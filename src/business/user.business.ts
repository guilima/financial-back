import { Context } from "koa";
import { userFindByEmail } from "@data/user.data"

const userExist = async (ctx: Context) => {
  const request: { email: string } = ctx.request.body;
  try {
    const { id } = await userFindByEmail(request.email) || { id: undefined };
    const response = Boolean(id);
    return ctx.body = { data: response };
  } catch (error) {
    ctx.throw(error);
  }
}

export {
  userExist
}
