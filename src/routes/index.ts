import Router from '@koa/router';
import Wallet from './wallet.routes';
import Auth from './auth.routes';
import User from './user.routes';
import { DefaultState, Context } from 'koa';
const router = new Router<DefaultState, Context>();
router
    .use(User.routes())
    .use(Auth.routes())
    .use(Wallet.routes());

export default router;