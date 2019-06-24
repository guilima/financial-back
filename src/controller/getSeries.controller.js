const query = require("../../query");

module.exports = (mongoDocument, ctx) => {
  const { idGroup, dateInitial, dateEnd } = ctx.request.body;
  const params = {
    series: idGroup.map(_id => ( { _id } )),
    date: {
      initial: new Date(dateInitial).toISOString(),
      end: new Date(dateEnd).toISOString()
    }
  };
  return query.getSeries(mongoDocument)(params).toArray();
}