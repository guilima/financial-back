import { Context } from "koa";
import { upsertSeries } from "@data/query";
import CentralBankAPI from "@services/centralBank.service";
import AlphaVantageAPI from "@services/alphaVantage.service";

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

function parseAlphaId(arr: string[], id: string): string[] {
  const parse = {
    '7832': '^BVSP'
  }
  return parse[id] ? arr.concat(parse[id]) : arr;
}

function percentage(number1: number, number2: number): number {
  const total = ( ( ( number2 * 100 ) / number1 ) - 100 ) * 1000;
  return Number( ( ( total < 0 ? Math.round(total) : Math.ceil(total) ) / 1000 ).toFixed(2) );
}

export default async (ctx: Context) => {
  const { idGroup, date: { initial, end } } = ctx.request.body;
  const centralBankAPI = new CentralBankAPI();
  const alphaVantageAPI = new AlphaVantageAPI();
  const idGroupCentralBank = idGroup.filter(id => parseId(id) !== "Ibovespa");
  const idGroupAlpha = idGroup.reduce(parseAlphaId, []);
  try {
    const getAlphaMonthlyResponse = await alphaVantageAPI.getMonthlySeries(idGroupAlpha);
    const alpha = getAlphaMonthlyResponse.map( item => {
      const dates = Object.keys(item["Monthly Time Series"]);
      const firstDateIndex = dates.findIndex(date => new RegExp(end.substring(0, 7)).test(date));
      if(firstDateIndex === -1) ctx.throw(500, `Ano e mês ${end} não encontrado na serie temporal mensal (getAlphaMonthlyResponse)`);
      const lastDateIndex = dates.findIndex(date => new RegExp(initial.substring(0, 7)).test(date));
      if(lastDateIndex === -1) ctx.throw(500, `Ano e mês ${initial} não encontrado na serie temporal mensal (getAlphaMonthlyResponse)`);
      const datesToInitial = dates.slice(firstDateIndex, lastDateIndex + 2)
      return {
        id: 7832,
        name: parseId("7832"),
        series: datesToInitial.reduce((arr, date, index) => {
          const currentDate = item["Monthly Time Series"][date];
          const previousDate = item["Monthly Time Series"][datesToInitial[index - 1]];
          return previousDate ? arr.concat({
            date: new Date(datesToInitial[index - 1].substring(0, 7)).toISOString(),
            value: currentDate ? percentage(currentDate["4. close"], previousDate["4. close"]) : null,
            disabled: false
          }) : arr;
        }, [])
      };
    });

    const getValoresSeriesResponse = await centralBankAPI.getValoresSeries({ idGroup: idGroupCentralBank, initial, end });
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
      items: json.concat(alpha),
      date: {
        initial: new Date(initial).toISOString(),
        end: new Date(end).toISOString()
      }
    }
    return ctx.body = {
      data: await upsertSeries(param)
    };
  } catch(err) {
    return err;
  }
};