import Router from '@koa/router';
import { login, register, logout, authverify } from './../business/auth.business';
import { DefaultState, Context } from 'koa';
import jwt from './../middleware/authValidator';
import authRenewer from './../middleware/authRenewer';
import googleRecaptcher from './../middleware/googleRecaptcher';
import schemaValidator from './../middleware/schemaValidator';
const routes = new Router<DefaultState, Context>();

routes
  .post('/register', schemaValidator, googleRecaptcher, register)
  .post('/authverify', schemaValidator, jwt, authRenewer, authverify)
  .post('/logout', schemaValidator, logout)
  .post('/login', schemaValidator, googleRecaptcher, login);

export default routes;