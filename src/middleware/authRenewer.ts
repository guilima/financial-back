import { jwtSecret, jwtRefreshSecret } from './../../config';
import JwToken from './../utils/jwt.utils';
import { Context, Next, Middleware } from 'koa';
import { redisStore } from './../../db';

const jwToken = new JwToken();

export default async (ctx: Context, next: Next): Promise<Middleware> => {
    const tokenAccess = ctx.cookies.get('tokenAccess', {signed: true});
    const tokenRefresh = ctx.session.tokenRefresh;
    try {
        const originalError = ctx.state.jwtOriginalError;
        if (!originalError) {
            return next();
        }
        if (originalError.name !== 'TokenExpiredError') {
            ctx.throw(401, 'Authentication Error', { originalError });
        }
        if(!tokenRefresh) {
            originalError.detail = 'Invalid Refresh Token';
            ctx.throw(401, 'Authentication Error', { originalError });
        }
        const isRefreshTokenRevoked = Number.isInteger(await redisStore.client.zrank('blacklist', tokenRefresh));
        if (isRefreshTokenRevoked) {
            originalError.detail = 'Revoked Refresh Token';
            ctx.throw(401, 'Authentication Error', { originalError });
        }
        const isRefreshTokenExpired = new Date() > new Date(jwToken.decode(tokenRefresh).exp * 1000);
        if (isRefreshTokenExpired) {
            originalError.detail = 'Expired Refresh Token';
            ctx.throw(401, 'Authentication Error', { originalError });
        }
        await redisStore.client.zadd('blacklist', (jwToken.decode(tokenRefresh).exp * 1000), tokenRefresh);
        await redisStore.client.zremrangebyscore('blacklist', '-inf', Date.now());
        const { sub: uid, name } = jwToken.decode(tokenAccess);
        const newTokenAccess = jwToken.sign({
            sub: uid,
            name: name,
            admin: false
        }, jwtSecret, '7 days');
        const newTokenRefresh = jwToken.sign({ sub: uid }, jwtRefreshSecret, '30 days');
        ctx.cookies.set('tokenAccess', newTokenAccess, {maxAge: 604800000, signed: true, sameSite: 'none'});
        ctx.session.tokenRefresh = newTokenRefresh;
        return await next();
    } catch (err) {
        if(!err.originalError.detail && tokenRefresh) {
            await redisStore.client.zadd('blacklist', (jwToken.decode(tokenRefresh).exp * 1000), tokenRefresh);
            await redisStore.client.zremrangebyscore('blacklist', '-inf', Date.now());
        }
        ctx.cookies.set('tokenAccess');
        delete ctx.session.tokenRefresh;
        throw err;
    }
}