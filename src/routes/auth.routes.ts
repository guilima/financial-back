import Router from '@koa/router';
import { login, register, logout } from '@business/auth.business';
import { DefaultState, Context } from 'koa';
const routes = new Router<DefaultState, Context>();

routes
  .post('/register', register)
  .post('/logout', logout)
  .post('/login', login);

export default routes;