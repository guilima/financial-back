import { request } from 'https';
import { googleRecaptchaV2ApiKey } from '../../config';

interface SiteVerify {success: boolean;challenge_ts: string;ostname: string;"error-codes"?: string[]}

export default class GoogleRecaptchaAPI {
  url: string;
  googleRecaptchaV2ApiKey: string;
  constructor() {
    this.url = 'https://www.google.com/recaptcha/api';
    this.googleRecaptchaV2ApiKey = googleRecaptchaV2ApiKey;
  }

  async siteVerify(recaptchaToken: string): Promise<SiteVerify> {
    const url = `${this.url}/siteverify?secret=${this.googleRecaptchaV2ApiKey}&response=${recaptchaToken}`
    try {
      return new Promise((resolve, reject) => {
        request(url, (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          }).on('end', () => {
            const responseParse = JSON.parse(data);
            typeof responseParse.success === "boolean" ? resolve(responseParse) : reject(responseParse);
          });
        }).on("error", (err) => {
          reject(err);
        }).end();
      })
    } catch (err) {
      throw err;
    }
  }
}