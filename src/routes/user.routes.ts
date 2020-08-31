import Router from '@koa/router';
import { userExist } from './../business/user.business';
import { DefaultState, Context } from 'koa';
import schemaValidator from './../middleware/schemaValidator';
const routes = new Router<DefaultState, Context>();

routes
  .get('/userExist', schemaValidator, userExist);

export default routes;