import https from 'https';
import { jwtToken } from './config';
import Crypto from 'crypto';

const today = new Date();
const threeMonthAgo = new Date(
  new Date().getFullYear(),
  new Date().getMonth() - 3, 
  new Date().getDate()
);
const header = { "alg": "HS256", "typ": "JWT" };
const payload = {
  "iss": "fintech-backend.io",
  "iat": Math.floor(Date.now() / 1000),
  "exp": Math.floor(Date.now() / 1000) + 600,
  "name": "Guilherme Lima",
  "admin": true
};
const encodedHeader = Buffer
  .from(JSON.stringify(header))
  .toString('base64')
  .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const encodedPayload = Buffer
  .from(JSON.stringify(payload))
  .toString('base64')
  .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const signature = Crypto
  .createHmac('sha256', jwtToken)
  .update( `${encodedHeader}.${encodedPayload}`)
  .digest('base64')
  .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
const jwt = `${encodedHeader}.${encodedPayload}.${signature}`;
const body = JSON.stringify({
  idGroup: [4391, 433, 189, 192, 7832, 7830, 196, 4390],
  date: {
    initial: threeMonthAgo.toISOString().substring(0,10),
    end: today.toISOString().substring(0,10)
  }
});
const options = {
  host: "fintech-backend.herokuapp.com",
  path: '/series',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  }
};
  
https.request(options, function(res) {
  console.log('STATUS: ' + res.statusCode);
  console.log('HEADERS: ' + JSON.stringify(res.headers));
  res.setEncoding('utf8');
  res.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
}).end(body);