import { createHmac } from 'crypto';

type claims = { sub: number, name?: string, admin?: boolean };

export default class JwToken {
  constructor() {
  }

  sign(claims: claims, secret: string, expireTime: string): string {
    const header = { "alg": "HS256", "typ": "JWT" };
    var [ , time, type] = expireTime.match(/(\d+)\s*(m[oi]|\w)?/);
    const timeType = { "y": 31557600, "mo": 2629800, "w": 605213, "d": 86400, "h": 3600, "mi": 60 };
    const payload = {
      "iss": "fintech-backend.io",
      "iat": Math.floor(Date.now() / 1000),
      "exp": Math.floor(Date.now() / 1000) + (Number(time) * timeType[type]),
      ...claims
    };

    const encodedHeader = Buffer
      .from(JSON.stringify(header))
      .toString('base64')
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const encodedPayload = Buffer
      .from(JSON.stringify(payload))
      .toString('base64')
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
    const signature = createHmac('sha256', secret)
      .update( `${encodedHeader}.${encodedPayload}`)
      .digest('base64')
      .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  decode(jwt: string): claims & {iss: string, iat: number, exp: number} {
    const [ , payloadBase64, ] = jwt.split(".");
    const payload = Buffer.from(payloadBase64, 'base64').toString('ascii');
    
    return JSON.parse(payload);
  }
}