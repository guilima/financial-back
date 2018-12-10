const mongoClient = require("mongodb").MongoClient;
const server = "mongodb://localhost:27018/db";
const mongo_db = 'test';

module.exports = (async () => {
  const client = await mongoClient.connect(
    server,
    { useNewUrlParser: true }
  );
  const db = client.db(mongo_db);
  return { client, db };
})();
