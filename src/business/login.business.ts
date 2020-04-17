import { Context } from "koa";
import { scryptSync } from 'crypto';
import { userLogin } from '@data/user.data';

export default async (ctx: Context) => {
  const { email, password } = ctx.request.body;
  const user = await userLogin(email);
  if (!user) ctx.throw(403, `Email não cadastrado`);
  const isVerifiedPassword = scryptSync(password, user.password_salt, 64, {N:1024}).toString('hex') === user.password_hash;
  if (!isVerifiedPassword) ctx.throw(401, `Senha inválida`);
  return ctx.body = { data: undefined };
}
