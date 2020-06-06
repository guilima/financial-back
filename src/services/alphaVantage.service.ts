import Https from 'https';
import { alphaApiKey } from '@root/config';
// import { IGetValoresSeriesJSONResponse } from "@schema/series.schema";

export default class AlphaVantageAPI {
  url: string;
  alphaApikey: string;
  constructor() {
    this.url = 'https://www.alphavantage.co/query';
    this.alphaApikey = alphaApiKey;
  }

  async getMonthlySeries(symbols: string[]) {
    try {
      const body = symbols.map(symbol => {
        return new Promise((resolve, reject) => {
          Https.get(`${this.url}?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${this.alphaApikey}`, (response) => {
            let data = '';
            response.on('data', (chunk) => {
              data += chunk;
            }).on('end', () => {
              const responseParse = JSON.parse(data);
              responseParse["Meta Data"] ? resolve(responseParse) : reject(responseParse);
            });
          }).on("error", (err) => {
            reject(err);
          });
        });
      });

      return await Promise.all(body);
    } catch(err) {
      throw err;
    }
  }
}