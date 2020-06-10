import Router from '@koa/router';
import schemaValidator from '@middleware/schemaValidator';
import Wallet from './wallet.routes';
import Auth from './auth.routes';
import Series from './series.routes';
import User from './user.routes';
import { DefaultState, Context } from 'koa';
const router = new Router<DefaultState, Context>();
router
    .use(schemaValidator)
    .use(User.routes())
    .use(Auth.routes())
    .use(Wallet.routes())
    .use(Series.routes());

export default router;