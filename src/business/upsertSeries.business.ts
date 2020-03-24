import { upsertSeries } from "@data/query";
import CentralBankAPI from "@services/centralBank.service";

function parseId(id: string): string {
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

function parseDateCentralBankResponse(date: string): string {
  const [ month, year ] = date.split(/\D+/);
  return new Date(`${year}-${month.padStart(2, "0")}`).toISOString();
}

export default async (ctx) => {
  const { idGroup, date: { initial, end } } = ctx.request.body;
  const centralBankAPI = new CentralBankAPI();

  try {
    const getValoresSeriesResponse = await centralBankAPI.getValoresSeries({ idGroup, initial, end });
    const json = getValoresSeriesResponse.map(serie => {
      return {
        id: serie.ID,
        name: parseId(serie.ID),
        series: serie.item.map( item => {
          return {
            date: parseDateCentralBankResponse(item.data),
            value: item.valor ? item.valor : null,
            disabled: item.bloqueado
          }
        }).reverse()
      }
    });
    const param = {
      items: json,
      date: {
        initial: new Date(initial).toISOString(),
        end: new Date(end).toISOString()
      }
    }
    const body = await upsertSeries(param);
    return body;
  } catch(err) {
    return err;
  }
};