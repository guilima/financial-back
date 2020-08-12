import { Context, Next, Middleware } from 'koa';
import GoogleRecaptchaAPI from '@services/googleRecaptcha.service';

const googleRecaptchaAPI = new GoogleRecaptchaAPI();

export default async (ctx: Context, next: Next): Promise<Middleware> => {
    const { recaptchaToken } = ctx.request.body;
    try {
        const googleRecaptchaVerify = await googleRecaptchaAPI.siteVerify(recaptchaToken);
        if (googleRecaptchaVerify.success) return await next();
        ctx.throw(401, `Recaptcha Token Inválido`, googleRecaptchaVerify);
    } catch (err) {
        throw err;
    }
}