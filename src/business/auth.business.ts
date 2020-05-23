import { Context } from 'koa';
import { scryptSync, randomBytes } from 'crypto';
import { authLogin, authRegister } from '@data/auth.data';
import { jwtSecret, jwtRefreshSecret } from '../../config';
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
  const isVerifiedPassword = scryptSync(password, user.password_salt, 64, { N: 1024 }).toString('hex') === user.password_hash;
  if (!isVerifiedPassword) ctx.throw(401, `Senha inválida`);
  const tokenAccess = jwToken.sign({
    sub: user.id,
    name: user.full_name,
    admin: false
  }, jwtSecret, '7 days');
  const tokenRefresh = jwToken.sign({ sub: user.id }, jwtRefreshSecret, '30 days');
  ctx.cookies.set('tokenAccess', tokenAccess, { maxAge: 604800000, signed: true, sameSite: 'none' });
  ctx.session.tokenRefresh = tokenRefresh;
  return ctx.body = { data: undefined };
}

const logout = async (ctx: Context) => {
  ctx.cookies.set('tokenAccess');
  if (ctx.session.tokenRefresh) {
    const redisClient = ctx.session._sessCtx.store.client;
    await redisClient.zadd('blacklist', (jwToken.decode(ctx.session.tokenRefresh).exp * 1000), ctx.session.tokenRefresh);
    await redisClient.zremrangebyscore('blacklist', '-inf', Date.now());
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
      email,
      createdAt: new Date().toISOString(),
    },
    login: {
      passwordHash,
      passwordSalt,
      ipAddress: ctx.request.ip,
    }
  }

  const user = await authRegister(param.user,  param.login);

  const tokenAccess = jwToken.sign({
    sub: user.id,
    name: fullName,
    admin: false
  }, jwtSecret, '7 days');
  const tokenRefresh = jwToken.sign({ sub: user.id }, jwtRefreshSecret, '30 days');
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
