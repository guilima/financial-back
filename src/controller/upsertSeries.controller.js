const query = require("../../query");
const Joi = require("joi");
const soap = require('soap');
const parseString = require('xml2js').parseString;
 
const schema = Joi.array().items(
  Joi.object().keys({
    id: Joi.number().required(),
    name: Joi.string().required(),
    series: Joi.array().items(
      Joi.object().keys({
        date: Joi.date().max('now').required(),
        value: Joi.number().allow(null),
        disabled: Joi.boolean().required()
      })
    ).unique().required(),
  })
);

function parseDatePTBR(date) {
  date = date.substring(0,10).split('-')
  return date[2] + '/' + date[1] + '/' + date[0];
}

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
  return parse[id] || colors.default;
}

function parseDate(s) {
  const date = s.split(/\D+/);
  return new Date(Date.UTC(date[1], date[0]-1)).toISOString();
}

function parseStringSync (xml, options) {
  let result;
  parseString(xml, options, (_, r) => { result = r });
  return result;
}

const arrayConcatNoDuplicate = (values) => Array.from(new Set([].concat(values)));

module.exports = async (mongoDocument, ctx) => {
  const {idGroup, date: { initial, end } } = ctx.request.body;
  const params = {
    series: [],
    dateInitial:"",
    dateEnd: ""
  }
  params.series = arrayConcatNoDuplicate(idGroup).map( id => Number(id));
  params.dateInitial = parseDatePTBR(initial);
  params.dateEnd = parseDatePTBR(end);
  
  const url = 'https://www3.bcb.gov.br/sgspub/JSP/sgsgeral/FachadaWSSGS.wsdl';

  return new Promise(function(resolve) {
    soap.createClient(url, ['disableCache'], function (err, client) {
      console.log(client);
      client.getValoresSeriesXML(params, function (err, result) {
        console.log(err);
        const options = {
          explicitRoot: false,
          normalizeTags: true,
          mergeAttrs: true,
          explicitArray: false
        };
        const parsed = parseStringSync(result.getValoresSeriesXMLReturn.$value, options);
        const json = [].concat(parsed.serie).map(serie => {
          return {
            id: Number(serie.ID),
            name: parseId(serie.ID),
            series: [].concat(serie.item).map( item =>  {
              return {
                date: parseDate(item.data),
                value: Math.round(item.valor * 100) / 100,
                disabled: item.bloqueado === "true"
              }
            }).reverse()
          }
        })

        const resultV = schema.validate(json);
        resolve(resultV.error || query.upsertSeries(mongoDocument)(resultV.value, new Date(end)));
      });
    });
  });
  
};