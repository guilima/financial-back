import { Context } from "koa";
import { utc } from 'moment';
import SeriesData from "@data/series.data";
import { Serie, SerieAlpha } from "@enums/serie.enum"
import CentralBankAPI from "@services/centralBank.service";
import AlphaVantageAPI from "@services/alphaVantage.service";

function percentage(number1: number, number2: number): number {
  const total = ( ( ( number2 * 100 ) / number1 ) - 100 ) * 1000;
  return Number( ( ( total < 0 ? Math.round(total) : Math.ceil(total) ) / 1000 ).toFixed(2) );
}

const centralBankAPI = new CentralBankAPI();
const alphaVantageAPI = new AlphaVantageAPI();
const seriesData = new SeriesData();

export default async (ctx: Context) => {
  const { idGroup, date: { initial, end } } = ctx.request.body;
  const idGroupCentralBank = idGroup.filter((id: number) => !SerieAlpha[id]);
  const idGroupAlpha = idGroup.reduce((arr: string[], id: number) => arr.concat(SerieAlpha[id] || []), []);
  try {
    const getAlphaMonthlyResponse = await alphaVantageAPI.getMonthlySeries(idGroupAlpha);
    const seriesAlpha = getAlphaMonthlyResponse.map( (item: any) => {
      const dates = Object.keys(item["Monthly Time Series"]);
      const firstDateIndex = dates.findIndex(date => new RegExp(end.substring(0, 7)).test(date));
      if(firstDateIndex === -1) ctx.throw(500, `Ano e mês ${end} não encontrado na serie temporal mensal (getAlphaMonthlyResponse)`);
      const lastDateIndex = dates.findIndex(date => new RegExp(initial.substring(0, 7)).test(date));
      if(lastDateIndex === -1) ctx.throw(500, `Ano e mês ${initial} não encontrado na serie temporal mensal (getAlphaMonthlyResponse)`);
      const datesToInitial = dates.slice(firstDateIndex, lastDateIndex + 2);
      const symbol:string = item["Meta Data"]["2. Symbol"];
      return {
        id: SerieAlpha[symbol],
        name: Serie[SerieAlpha[symbol]],
        series: datesToInitial.reduce((arr, date, index) => {
          const currentDate = item["Monthly Time Series"][date];
          const previousDate = item["Monthly Time Series"][datesToInitial[index - 1]];
          return previousDate ? arr.concat({
            date: utc(datesToInitial[index - 1]).startOf("month").toISOString(),
            value: currentDate ? percentage(currentDate["4. close"], previousDate["4. close"]) : null,
            disabled: false
          }) : arr;
        }, [])
      };
    });

    const getValoresSeriesResponse = await centralBankAPI.getValoresSeries({ idGroup: idGroupCentralBank, initial, end });
    const seriesCentralBank = getValoresSeriesResponse.map(serie => {
      return {
        id: serie.ID,
        name: Serie[serie.ID],
        series: serie.item.map( item => {
          return {
            date: utc(item.data, "MM/YYYY").toISOString(),
            value: item.valor ? item.valor : null,
            disabled: item.bloqueado
          }
        }).reverse()
      }
    });
    const series = seriesCentralBank.concat(seriesAlpha);
    return ctx.body = {
      data: await seriesData.upsert(series)
    };
  } catch(err) {
    ctx.throw(err);
  }
};