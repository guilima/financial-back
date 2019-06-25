import https from 'https';
import { port } from './config';

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
const options = {
  host: "fintech-backend.herokuapp.com",
  port: port,
  path: '/series',
  method: 'POST',
  headers: {
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