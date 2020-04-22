import { jwtSecret, jwtRefreshSecret } from '../../config';
import JwToken from '@utils/jwt.utils';
import { Context, Next, Middleware } from 'koa';

const jwToken = new JwToken();

export default async (ctx: Context, next: Next): Promise<Middleware> => {
    const redisClient = ctx.session._sessCtx.store.client;
    const tokenAccess = ctx.cookies.get('tokenAccess', {signed: true});
    const tokenRefresh = ctx.session.tokenRefresh;
    try {
        const originalError = ctx.state.jwtOriginalError;
        if (!originalError) {
            return next();
        }
        if (originalError.name !== 'TokenExpiredError') {
            ctx.throw(401, "Authentication Error", { originalError });
        }
        if(!tokenRefresh) {
            originalError.detail = "Invalid Refresh Token";
            ctx.throw(401, "Authentication Error", { originalError });
        }
        const isRefreshTokenRevoked = Number.isInteger(await redisClient.zrank('blacklist', tokenRefresh));
        if (isRefreshTokenRevoked) {
            originalError.detail = "Revoked Refresh Token";
            ctx.throw(401, "Authentication Error", { originalError });
        }
        const isRefreshTokenExpired = new Date() > new Date(jwToken.decode(tokenRefresh).exp * 1000);
        if (isRefreshTokenExpired) {
            originalError.detail = "Expired Refresh Token";
            ctx.throw(401, "Authentication Error", { originalError });
        }
        await redisClient.zadd('blacklist', (jwToken.decode(tokenRefresh).exp * 1000), tokenRefresh);
        await redisClient.zremrangebyscore('blacklist', '-inf', Date.now());
        const { sub: uid, name } = jwToken.decode(tokenAccess);
        const newTokenAcess = jwToken.sign({
            sub: uid,
            name: name,
            admin: false
        }, jwtSecret, '1 minute');
        const newTokenRefresh = jwToken.sign({ sub: uid }, jwtRefreshSecret, '30 days');
        ctx.cookies.set('tokenAccess' , newTokenAcess, {maxAge: 604800000, signed: true});
        ctx.session.tokenRefresh = newTokenRefresh;
        return await next();
    } catch (err) {
        if(!err.originalError.detail && tokenRefresh) {
            await redisClient.zadd('blacklist', (jwToken.decode(tokenRefresh).exp * 1000), tokenRefresh);
            await redisClient.zremrangebyscore('blacklist', '-inf', Date.now());
        }
        ctx.cookies.set('tokenAccess');
        delete ctx.session.tokenRefresh;
        throw err;
    }
}