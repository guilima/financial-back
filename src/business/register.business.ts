import { Context } from "koa";
import { userRegister } from "@data/user.data"
import { scryptSync, randomBytes } from 'crypto';
import GoogleRecaptchaAPI from "@services/googleRecaptcha.service";

const googleRecaptchaAPI = new GoogleRecaptchaAPI();

export default async (ctx: Context) => {
  const { fullName, userName, email, password, recaptchaToken } = ctx.request.body;
  const googleRecaptchaVerify = await googleRecaptchaAPI.siteVerify(recaptchaToken);
  if(!googleRecaptchaVerify.success) ctx.throw(401, `Recaptcha Token Inválido`, googleRecaptchaVerify);
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
