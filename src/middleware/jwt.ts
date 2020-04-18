import koaJwt from 'koa-jwt';
import { jwtSecret } from '../../config';

export default koaJwt({
  cookie: "tokenAccess",
  secret: jwtSecret
});