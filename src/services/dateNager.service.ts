import Https from 'https';

interface IResponsePublicHolidays {
  date:	string;
  localName?: string;
  name?:	string;
  countryCode?: string;
  fixed: boolean;
  global:	boolean;
  counties?:	string[];
  launchYear?: number;
  type:	"Public" | "Bank" | "School" | "Authorities" | "Optional" | "Observance";
}

export default class DateNagerAPI {
  url: string;
  constructor() {
    this.url = 'https://date.nager.at/api/v2/PublicHolidays';
  }

  async getPublicHolidays(years: number[], country: string): Promise<Array<IResponsePublicHolidays[]>> {
    try {
      const body: Array<Promise<IResponsePublicHolidays[]>> = years.map(year => {
        return new Promise((resolve, reject) => {
          Https.get(`${this.url}/${year}/${country}`, (response) => {
            let data = '';
            response.on('data', (chunk) => {
              data += chunk;
            }).on('end', () => {
              // Date Nager API doesn't return the last day of a year as holiday;
              const responseParse = JSON.parse(data).concat({date: `${year}-12-31`} as IResponsePublicHolidays);
              resolve(responseParse);
            });
          }).on("error", (err) => {
            reject(err);
          });
        });
      });

      return await Promise.all(body);
    } catch(err) {
      return err;
    }
  }
}