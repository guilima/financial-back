const query = require("../../query");
const Joi = require("joi");
const schema = Joi.object({
  idGroup: Joi.array().items(Joi.number()).single().unique().required(),
  dateInitial: Joi.date().iso().max('now').required().raw(),
  dateEnd: Joi.date().iso().max('now').min(Joi.ref('dateInitial')).required().raw()
});

function parseDate(date) {
  const [ year, month, day ] = date.substr(0, 10).split('-');
  return new Date(year, month - 1, day);
}

module.exports = (mongoDocument, ctx) => {
  const body = schema.validate(ctx.query);
  if(body.error) {
    return body.error;
  }
  const { idGroup, dateInitial, dateEnd } = body.value;
  const params = {
    series: idGroup.map(_id => ( { _id } )),
    date: {
      initial: parseDate(dateInitial),
      end: parseDate(dateEnd)
    }
  };

  return query.getSeries(mongoDocument)(params).toArray();
}