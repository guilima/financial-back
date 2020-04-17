import Router from '@koa/router';
import login from '@business/login.business';
import logout from '@business/logout.business';
import register from '@business/register.business';
const routes = new Router();

routes
  .post('/register', register)
  .post('/logout', logout)
  .post('/login', login);

export default routes;