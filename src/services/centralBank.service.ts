import SoapClient from 'soap';
import Xml2js from 'xml2js';
import { IGetValoresSeriesJSONResponse } from "../schema/series.schema";

function parseDateCentralBankRequest(date: string): string {
  const [year, month, day] = date.substr(0, 10).split('-');
  return day + '/' + month + '/' + year;
}

function parseStringSync(xml: Xml2js.convertableToString, options: Xml2js.OptionsV2) {
  let result: {
    serie: [{
      ID: number,
      item: [{
        bloqueado: string
        data: string
        valor: string
      }]
    }]
  };
  Xml2js.parseString(xml, options, (_, r) => { result = r });
  return result;
}

export default class CentralBankAPI {
  url: string;
  option: SoapClient.IOptions;
  constructor() {
    this.url = 'https://www3.bcb.gov.br/sgspub/JSP/sgsgeral/FachadaWSSGS.wsdl';
    this.option = {
      disableCache: true,
      wsdl_options: {
        rejectUnauthorized: false,
      }
    };
  }

  async getValoresSeries(payload) {
    const param = {
      series: payload.idGroup,
      dateInitial: parseDateCentralBankRequest(payload.initial),
      dateEnd: parseDateCentralBankRequest(payload.end)
    };

    try {
      const client = await SoapClient.createClientAsync(this.url, this.option);
      // client.setSecurity(new soap.ClientSSLSecurity(
      //   './src/client-key.pem',
      //   './src/client-cert.pem',
      //   [fs.readFileSync('./src/ca1.pem', 'utf8'), fs.readFileSync('./src/ca2.pem', 'utf8'), fs.readFileSync('./src/ca3.pem', 'utf8')],
      //    {
      //     rejectUnauthorized: false
      //    }
      // ));
      const getValoresSeriesXMLResponse: any = await new Promise((resolve, reject) => {
        client.getValoresSeriesXML(param, (err, result) => {
          if(!err) {
            return resolve(result);
          } else {
            return reject(err);
          }
        });
      });

      const getValoresSeriesJSONResponse = parseStringSync(
        getValoresSeriesXMLResponse.getValoresSeriesXMLReturn.$value,
        {
          explicitRoot: false,
          normalizeTags: true,
          mergeAttrs: true,
          explicitArray: false
        }
      );
      const body = IGetValoresSeriesJSONResponse.validate(getValoresSeriesJSONResponse.serie);
      return body;
    } catch(err) {
      return err;
    }
  }
}