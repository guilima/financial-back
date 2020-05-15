import Router from '@koa/router';
import { userExist } from '@business/user.business';
import { DefaultState, Context } from 'koa';
const routes = new Router<DefaultState, Context>();

routes
  .get('/userExist', userExist);

export default routes;