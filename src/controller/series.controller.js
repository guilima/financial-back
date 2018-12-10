const query = require("./query.js");

module.exports = (mongoDocument, params) => query.getSeries(mongoDocument)(params)
  .toArray((err, results) => {
    console.log(JSON.stringify(results));
  });