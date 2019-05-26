const query = require("../../query");
const Joi = require("joi");
const schema = Joi.object({
  idGroup: Joi.array().items(Joi.number()).single().unique().required(),
  dateInitial: Joi.date().iso().max('now').required().raw(),
  dateEnd: Joi.date().iso().max('now').min(Joi.ref('dateInitial')).required().raw()
});

module.exports = (mongoDocument, ctx) => {
  const body = schema.validate(ctx.query);
  if(body.error) {
    return body.error;
  }
  const { idGroup, dateInitial, dateEnd } = body.value;
  const params = {
    series: idGroup.map(_id => ( { _id } )),
    date: {
      initial: new Date(dateInitial).toISOString(),
      end: new Date(dateEnd).toISOString()
    }
  };

  return query.getSeries(mongoDocument)(params).toArray();
}