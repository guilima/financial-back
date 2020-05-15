import Router from '@koa/router';
import { login, register, logout, authverify } from '@business/auth.business';
import { DefaultState, Context } from 'koa';
import jwt from '@middleware/authValidator';
import authRenewer from '@middleware/authRenewer';
const routes = new Router<DefaultState, Context>();

routes
  .post('/register', register)
  .post('/authverify', jwt, authRenewer, authverify)
  .post('/logout', logout)
  .post('/login', login);

export default routes;