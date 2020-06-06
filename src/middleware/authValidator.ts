import koaJwt from 'koa-jwt';
import { jwtSecret } from '@root/config';

export default koaJwt({
  cookie: "tokenAccess",
  passthrough: true,
  secret: jwtSecret
});