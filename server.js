const Koa = require('koa');
const indexRoutes = require('./src/routes/routes');

const query = require("./query.js");

const app = new Koa();
const PORT = process.env.PORT || 1337;

(async () => {
  const { client, db } = await require('./src/mongodb');
  const documentInvetory2 = db.collection('inventory2');
  const params = {
    series: [
      { id: 196 },
      { id: 433 }
    ],
    date: {
      initial: new Date("2018-01-01T00:00:00Z"),
      end: new Date("2018-08-01T00:00:00Z")
    }
  }

  query.getSeries(documentInvetory2)(params)
    .toArray((err, results) => {
      console.log(JSON.stringify(results));
    });
})()


app.use(indexRoutes.routes());

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;