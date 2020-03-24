import { object, array, ref, date, number, string, boolean } from "@hapi/joi";

const IGetSeries = object({
  idGroup: array().items(number()).single().unique().required(),
  dateInitial: date().iso().max('now').required().raw(),
  dateEnd: date().iso().max('now').min(ref('dateInitial')).required().raw()
});
const IUpsertSeries = object({
  idGroup: array().items(number()).single().unique().required(),
  date: object({
    initial: date().iso().max('now').required().raw(),
    end: date().iso().max('now').min(ref('initial')).required().raw()
  })
})
const IGetValoresSeriesJSONResponse = array().items(
  object({
    ID: number().required(),
    item: array().items(
      object({
        data: string().regex(/^\d+\/\d+$/, 'MM/YYYY').required(),
        valor: number().precision(2).allow("").required(),
        bloqueado: boolean().required()
      })
    ).single().unique().required(),
  })
).single().unique().required();

export {
  IGetSeries,
  IUpsertSeries,
  IGetValoresSeriesJSONResponse
}