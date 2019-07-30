import koaJwt from 'koa-jwt';
import { jwtToken } from '../../config';

export default koaJwt({
  secret: jwtToken,
});