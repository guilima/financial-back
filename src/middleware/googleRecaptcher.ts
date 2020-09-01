import { Context, Next, Middleware } from 'koa';
import GoogleRecaptchaAPI from './../services/googleRecaptcha.service';

const googleRecaptchaAPI = new GoogleRecaptchaAPI();

export default async (ctx: Context, next: Next): Promise<Middleware> => {
    const request: { recaptchaToken: string } = ctx.request.body;
    try {
        const googleRecaptchaVerify = await googleRecaptchaAPI.siteVerify(request.recaptchaToken);
        if (googleRecaptchaVerify.success) return await next();
        ctx.throw(401, `Recaptcha Token Inválido`, googleRecaptchaVerify);
    } catch (err) {
        throw err;
    }
}