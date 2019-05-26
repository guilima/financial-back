const query = require("../../query");
const Joi = require("joi");
const soap = require('soap');
const parseString = require('xml2js').parseString;
// const fs = require('fs');
const schema = Joi.object({
  idGroup: Joi.array().items(Joi.number()).single().unique().required(),
  date: Joi.object({
    initial: Joi.date().iso().max('now').required().raw(),
    end: Joi.date().iso().max('now').min(Joi.ref('initial')).required().raw()
  })
});

function parseId(id) {
  const parse = {
    '4391': 'CDI',
    '433': 'IPCA',
    '189': 'IGP-M',
    '192': 'INCC',
    '7832': 'Ibovespa',
    '7830': 'Ouro',
    '196': 'Poupança',
    '4390': 'SELIC',
    'default': ''
  }
  return parse[id] || parse.default;
}

function parseDateCentralBankRequest(date) {
  const [ year, month, day ] = date.substr(0, 10).split('-');
  return day + '/' + month + '/' + year;
}

function parseDateCentralBankResponse(date) {
  const [ month, year ] = date.split(/\D+/);
  return new Date(`${year}-${month.padStart(2, "0")}`).toISOString();
}

function parseStringSync (xml, options) {
  let result;
  parseString(xml, options, (_, r) => { result = r });
  return result;
}

module.exports = async (mongoDocument, ctx) => {
  const body = schema.validate(ctx.request.body);
  if(body.error) {
    return body.error;
  }
  const { idGroup, date: { initial, end } } = body.value;
  const soapClient = {
    url: 'https://www3.bcb.gov.br/sgspub/JSP/sgsgeral/FachadaWSSGS.wsdl',
    option: {
      disableCache: true,
      wsdl_options: {
        rejectUnauthorized: false,
      }
    },
    param: {
      series: idGroup,
      dateInitial: parseDateCentralBankRequest(initial),
      dateEnd: parseDateCentralBankRequest(end)
    },
    schema: Joi.array().items(
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
    ).single().unique().required()
  }

  try {
    const client = await soap.createClientAsync(soapClient.url, soapClient.option);

    // client.setSecurity(new soap.ClientSSLSecurity(
    //   './src/client-key.pem',
    //   './src/client-cert.pem',
    //   [fs.readFileSync('./src/ca1.pem', 'utf8'), fs.readFileSync('./src/ca2.pem', 'utf8'), fs.readFileSync('./src/ca3.pem', 'utf8')],
    //    {
    //     rejectUnauthorized: false
    //    }
    // ));

    return new Promise(function(resolve) {
      client.getValoresSeriesXML(soapClient.param, function (err, result) {
        if(err) {
          return resolve(err);
        }
        const options = {
          explicitRoot: false,
          normalizeTags: true,
          mergeAttrs: true,
          explicitArray: false
        };
        const parsed = parseStringSync(result.getValoresSeriesXMLReturn.$value, options);
        const body = soapClient.schema.validate(parsed.serie);
        if(body.error) {
          return resolve(body.error);
        }
        const json = body.value.map(serie => (
          {
            id: serie.ID,
            name: parseId(serie.ID),
            series: serie.item.map( item => (
              {
                date: parseDateCentralBankResponse(item.data),
                value: item.valor ? item.valor : null,
                disabled: item.bloqueado
              }
            )).reverse()
          }
        ));
        const param = {
          items: json,
          date: {
            initial: new Date(initial).toISOString(),
            end: new Date(end).toISOString()
          }
        }
        return resolve(query.upsertSeries(mongoDocument)(param));
      });
    });
  } catch(err) {
    return err.toString();
  }
};