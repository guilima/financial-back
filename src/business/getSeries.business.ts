import { getSeries } from "@data/query";
import { Context } from "koa";

export default async (ctx: Context) => {
  const { idGroup, dateInitial, dateEnd } = ctx.request.body;
  const [iYear, iMonth] = dateInitial.split("-");
  const params = {
    series: idGroup.map(_id => ( { _id } )),
    date: {
      initial: new Date(`${iYear}-${iMonth}-01`).toISOString(),
      end: new Date(dateEnd).toISOString()
    }
  };
  const body = await getSeries(params);
  return body.toArray();
}
