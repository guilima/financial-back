import { Context } from "koa";
import { userFindByEmail } from "@data/user.data"

const userExist = async (ctx: Context) => {
  const { email } = ctx.request.body;
  try {
    const data = await userFindByEmail(email);
    return ctx.body = { data: data && data.id ? true : false };
  } catch (error) {
    ctx.throw(error);
  }
}

export {
  userExist
}
