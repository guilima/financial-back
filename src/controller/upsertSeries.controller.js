const query = require("../../query");
const Joi = require("joi");
const CentralBankAPI = require("../services/centralBank.service");
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

function parseDateCentralBankResponse(date) {
  const [ month, year ] = date.split(/\D+/);
  return new Date(`${year}-${month.padStart(2, "0")}`).toISOString();
}

module.exports = async (mongoDocument, ctx) => {
  const body = schema.validate(ctx.request.body);
  if(body.error) {
    return body.error;
  }
  const { idGroup, date: { initial, end } } = body.value;

  try {
    const centralBankAPI = new CentralBankAPI();
    const body = await centralBankAPI.getValoresSeries({ idGroup, initial, end });

    if(body.error) {
      return body.error;
    }
    const json = body.map(serie => (
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
    return query.upsertSeries(mongoDocument)(param);
  } catch(err) {
    return err.toString();
  }
};