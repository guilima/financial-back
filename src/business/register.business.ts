import { Context } from "koa";
import { userRegister } from "@data/user.data"
import { scryptSync, randomBytes } from 'crypto';

export default async (ctx: Context) => {
  const { fullName, userName, email, password } = ctx.request.body;
  const passwordSalt = randomBytes(32);
  const passwordHash = scryptSync(password, passwordSalt, 64, {N:1024}).toString('hex');
  const param = {
    user: {
      userName,
      fullName,
      email,
      createdAt: new Date().toISOString(),
    },
    login: {
      passwordHash,
      passwordSalt,
      ipAddress: ctx.request.ip,
    }
  }

  const data = await userRegister(param.user,  param.login);

  return ctx.body = { data: data };
}
