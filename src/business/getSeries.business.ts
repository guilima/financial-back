import { getSeries } from "@data/series.data";
import { Context } from "koa";
import { utc } from 'moment';

export default async (ctx: Context) => {
  const { idGroup, dateInitial, dateEnd } = ctx.request.body;
  const params = {
    series: idGroup.map(_id => ( { _id } )),
    date: {
      initial: utc(dateInitial).startOf("month").toISOString(),
      end: new Date(dateEnd).toISOString()
    }
  };
  return ctx.body = {
    data: await getSeries(params)
  };
}
