import { Context } from "koa";
import { scryptSync } from 'crypto';
import { userLogin } from '@data/user.data';
import { jwtSecret, jwtRefreshSecret } from '../../config';
import JwToken from '@utils/jwt.utils';
import GoogleRecaptchaAPI from "@services/googleRecaptcha.service";

const googleRecaptchaAPI = new GoogleRecaptchaAPI();

const jwToken = new JwToken();
export default async (ctx: Context) => {
  const { email, password, recaptchaToken } = ctx.request.body;
  const googleRecaptchaVerify = await googleRecaptchaAPI.siteVerify(recaptchaToken);
  if(!googleRecaptchaVerify.success) ctx.throw(401, `Recaptcha Token Inválido`, googleRecaptchaVerify);
  const user = await userLogin(email);
  if (!user) ctx.throw(403, `Email não cadastrado`);
  const isVerifiedPassword = scryptSync(password, user.password_salt, 64, {N:1024}).toString('hex') === user.password_hash;
  if (!isVerifiedPassword) ctx.throw(401, `Senha inválida`);
  const tokenAcess = jwToken.sign({
    sub: user.id,
    name: user.full_name,
    admin: false
  }, jwtSecret, "1 minute");
  const tokenRefresh = jwToken.sign({ sub: user.id }, jwtRefreshSecret, "30 days");
  ctx.cookies.set('tokenAccess' , tokenAcess, {maxAge: 604800000, signed: true, sameSite: "none"});
  ctx.session.tokenRefresh = tokenRefresh;
  return ctx.body = { data: undefined };
}
