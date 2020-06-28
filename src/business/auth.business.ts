import { Context } from 'koa';
import { scryptSync, randomBytes } from 'crypto';
import { authLogin, authUpdateLogin, authRegister } from '@data/auth.data';
import { jwtSecret, jwtRefreshSecret } from '@root/config';
import { redisStore } from '@root/db';
import JwToken from '@utils/jwt.utils';
import GoogleRecaptchaAPI from '@services/googleRecaptcha.service';

const googleRecaptchaAPI = new GoogleRecaptchaAPI();
const jwToken = new JwToken();

const login = async (ctx: Context) => {
  const { email, password, recaptchaToken } = ctx.request.body;
  const googleRecaptchaVerify = await googleRecaptchaAPI.siteVerify(recaptchaToken);
  if (!googleRecaptchaVerify.success) ctx.throw(401, `Recaptcha Token Inválido`, googleRecaptchaVerify);
  const user = await authLogin(email);
  if (!user) ctx.throw(403, `Email não cadastrado`);
  const isVerifiedPassword = scryptSync(password, user.passwordSalt, 64, { N: 1024 }).toString('hex') === user.passwordHash;
  if (!isVerifiedPassword) ctx.throw(401, `Senha inválida`);
  const tokenAccess = jwToken.sign({
    sub: user.id,
    name: user.fullName,
    admin: false
  }, jwtSecret, '7 days');
  const tokenRefresh = jwToken.sign({ sub: user.id }, jwtRefreshSecret, '30 days');
  ctx.cookies.set('tokenAccess', tokenAccess, { maxAge: 604800000, signed: true, sameSite: 'none' });
  ctx.session.tokenRefresh = tokenRefresh;
  await authUpdateLogin({loggedAt: new Date()}, user.id);
  return ctx.body = { data: undefined };
}

const logout = async (ctx: Context) => {
  ctx.cookies.set('tokenAccess');
  if (ctx.session.tokenRefresh) {
    await redisStore.client.zadd('blacklist', (jwToken.decode(ctx.session.tokenRefresh).exp * 1000), ctx.session.tokenRefresh);
    await redisStore.client.zremrangebyscore('blacklist', '-inf', Date.now());
    delete ctx.session.tokenRefresh;
  }
  return ctx.body = { data: undefined };
}

const register = async (ctx: Context) => {
  const { fullName, userName, email, password, recaptchaToken } = ctx.request.body;
  const googleRecaptchaVerify = await googleRecaptchaAPI.siteVerify(recaptchaToken);
  if(!googleRecaptchaVerify.success) ctx.throw(401, `Recaptcha Token Inválido`, googleRecaptchaVerify);
  const passwordSalt = randomBytes(32);
  const passwordHash = scryptSync(password, passwordSalt, 64, {N:1024}).toString('hex');
  const param = {
    user: {
      userName,
      fullName,
      email
    },
    login: {
      passwordHash,
      passwordSalt,
      ipAddress: ctx.request.ip,
    }
  }

  const userId = await authRegister(param.user,  param.login);

  const tokenAccess = jwToken.sign({
    sub: userId,
    name: fullName,
    admin: false
  }, jwtSecret, '7 days');
  const tokenRefresh = jwToken.sign({ sub: userId }, jwtRefreshSecret, '30 days');
  ctx.cookies.set('tokenAccess', tokenAccess, { maxAge: 604800000, signed: true, sameSite: 'none' });
  ctx.session.tokenRefresh = tokenRefresh;

  return ctx.body = { data: param.user };
}

const authverify = async (ctx: Context) => {
  return ctx.status = 204;
}

export {
  login,
  logout,
  register,
  authverify
}
