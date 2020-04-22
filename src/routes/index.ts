import Router from '@koa/router';
import Auth from './auth.routes';
import schemaValidator from '@middleware/validate';
import Series from './routes';
import { DefaultState, Context } from 'koa';
const router = new Router<DefaultState, Context>();
router
    .use(schemaValidator)
    .use(Auth.routes())
    .use(Series.routes());

export default router;