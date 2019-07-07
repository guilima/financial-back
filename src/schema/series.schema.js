const Joi = require("@hapi/joi");
const IGetSeries = Joi.object({
  idGroup: Joi.array().items(Joi.number()).single().unique().required(),
  dateInitial: Joi.date().iso().max('now').required().raw(),
  dateEnd: Joi.date().iso().max('now').min(Joi.ref('dateInitial')).required().raw()
});
const IUpsertSeries = Joi.object({
  idGroup: Joi.array().items(Joi.number()).single().unique().required(),
  date: Joi.object({
    initial: Joi.date().iso().max('now').required().raw(),
    end: Joi.date().iso().max('now').min(Joi.ref('initial')).required().raw()
  })
})
const IGetValoresSeriesJSONResponse = Joi.array().items(
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

module.exports = {
    IGetSeries,
    IUpsertSeries,
    IGetValoresSeriesJSONResponse
}