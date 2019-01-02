const query = require("../../query");
const Joi = require("joi");
 
const schema = Joi.object().keys({
  series: Joi.array().items(Joi.object().keys({
    id: Joi.number().required()
  })).unique().required(),
  date: Joi.object().keys({
    initial: Joi.date().max('now').required(),
    end: Joi.date().max('now').min(Joi.ref('initial')).required()
  })
});

module.exports = (mongoDocument, ctx) => {
  const {idGroup, dateInitial, dateEnd} = ctx.query;
  const params = {
    series: [],
    date: {
      initial:"",
      end: ""
    }
  }
  params.series = [].concat(idGroup).map( id => ({id: Number(id)}));
  params.date = {
    initial: new Date(dateInitial),
    end: new Date(dateEnd)
  };
  const result = schema.validate(params);
  return result.error || query.getSeries(mongoDocument)(result.value).toArray();
}