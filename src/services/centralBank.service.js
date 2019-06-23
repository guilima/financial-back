const Joi = require("joi");
const soap = require('soap');
const parseString = require('xml2js').parseString;
const schema = Joi.array().items(
  Joi.object({
    ID: Joi.number().required(),
    item: Joi.array().items(
      Joi.object({
        data: Joi.string().regex(/^\d+\/\d+$/, 'MM/YYYY').required(),
        valor: Joi.number().precision(2).allow("").required(),
        bloqueado: Joi.boolean().required()
      })
    ).single().unique().required(),
  })
).single().unique().required();

function parseDateCentralBankRequest(date) {
  const [year, month, day] = date.substr(0, 10).split('-');
  return day + '/' + month + '/' + year;
}

function parseStringSync(xml, options) {
  let result;
  parseString(xml, options, (_, r) => { result = r });
  return result;
}

module.exports = class CentralBankAPI {
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
      const client = await soap.createClientAsync(this.url, this.option);
      // client.setSecurity(new soap.ClientSSLSecurity(
      //   './src/client-key.pem',
      //   './src/client-cert.pem',
      //   [fs.readFileSync('./src/ca1.pem', 'utf8'), fs.readFileSync('./src/ca2.pem', 'utf8'), fs.readFileSync('./src/ca3.pem', 'utf8')],
      //    {
      //     rejectUnauthorized: false
      //    }
      // ));
      const getValoresSeriesXMLResponse = await new Promise((resolve, reject) => {
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
      const body = schema.validate(getValoresSeriesJSONResponse.serie);
      return body;
    } catch(err) {
      return err;
    }
  }
}