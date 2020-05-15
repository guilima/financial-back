import Router from '@koa/router';
import login from '@business/login.business';
import logout from '@business/logout.business';
import register from '@business/register.business';
import { DefaultState, Context } from 'koa';
const routes = new Router<DefaultState, Context>();

routes
  .post('/register', register)
  .post('/logout', logout)
  .post('/login', login);

export default routes;