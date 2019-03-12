const mongoClient = require("mongodb").MongoClient;
const { db: {host, database } } = require('./../config');

module.exports = (async () => {
  const client = await mongoClient.connect(
    host,
    { useNewUrlParser: true }
  );
  const db = client.db(database);
  return { client, db };
})();
