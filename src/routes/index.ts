import Router from '@koa/router';
import Auth from './auth.routes';
import schemaValidator from '@middleware/validate';
import Series from './routes';
const router = new Router();
router
    .use(schemaValidator)
    .use(Auth.routes())
    .use(Series.routes());

export default router;