const mongoClient = require("mongodb").MongoClient;
const { db: {host, database, user, password } } = require('./../config');

module.exports = (async () => {
  const url = password ? `mongodb://${user}:${password}@${host}/${database}` : `mongodb://${host}/${database}`;
  const client = await mongoClient.connect(
    url,
    { useNewUrlParser: true }
  );
  const db = client.db(database);
  return { client, db };
})();
