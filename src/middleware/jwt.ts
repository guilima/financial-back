import koaJwt from 'koa-jwt';
import { jwtSecret } from '../../config';

export default koaJwt({
  secret: jwtSecret,
});