const query = require("../data/query");

module.exports = async (ctx) => {
  const { idGroup, dateInitial, dateEnd } = ctx.request.body;
  const params = {
    series: idGroup.map(_id => ( { _id } )),
    date: {
      initial: new Date(dateInitial).toISOString(),
      end: new Date(dateEnd).toISOString()
    }
  };
  const body = await query.getSeries(params);
  return body.toArray();
}