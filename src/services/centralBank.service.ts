import { createClientAsync, IOptions } from 'soap';
import { convertableToString, parseString, OptionsV2 } from 'xml2js';
import { IGetValoresSeriesJSONResponse } from "@schema/series.schema";
import { utc } from 'moment';

function parseStringSync(xml: convertableToString, options: OptionsV2) {
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
  parseString(xml, options, (_, r) => { result = r });
  return result;
}

export default class CentralBankAPI {
  url: string;
  option: IOptions;
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
      dateInitial: utc(payload.initial, "YYYY-MM-DD").format("DD/MM/YYYY"),
      dateEnd: utc(payload.end, "YYYY-MM-DD").format("DD/MM/YYYY")
    };

    try {
      const client = await createClientAsync(this.url, this.option);
      // client.setSecurity(new soap.ClientSSLSecurity(
      //   './src/client-key.pem',
      //   './src/client-cert.pem',
      //   [fs.readFileSync('./src/ca1.pem', 'utf8'), fs.readFileSync('./src/ca2.pem', 'utf8'), fs.readFileSync('./src/ca3.pem', 'utf8')],
      //    {
      //     rejectUnauthorized: false
      //    }
      // ));
      const getValoresSeriesXMLResponse = await client.getValoresSeriesXMLAsync(param);

      const getValoresSeriesJSONResponse = parseStringSync(
        getValoresSeriesXMLResponse[0].getValoresSeriesXMLReturn.$value,
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
      throw err;
    }
  }
}