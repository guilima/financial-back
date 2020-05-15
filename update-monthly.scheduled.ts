import { request } from 'https';
import { jwtSecret } from './config';
import JwToken from '@utils/jwt.utils';

const jwToken = new JwToken();
const today = new Date();
const threeMonthAgo = new Date(
  new Date().getFullYear(),
  new Date().getMonth() - 3, 
  new Date().getDate()
);
const body = JSON.stringify({
  idGroup: [4391, 433, 189, 192, 7832, 7830, 196, 4390],
  date: {
    initial: threeMonthAgo.toISOString().substring(0,10),
    end: today.toISOString().substring(0,10)
  }
});
const claims = {
  sub: 1,
  name: "Guilherme Lima",
  admin: true
};
const options = {
  host: "fintech-backend.herokuapp.com",
  path: '/series',
  method: 'POST',
  headers: {
    'Cookie': `tokenAccess=${jwToken.sign(claims, jwtSecret, "1 minute")}; path=/series; httponly`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};
  
request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
}).end(body);