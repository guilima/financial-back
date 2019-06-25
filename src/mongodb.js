import MongoClient from "mongodb";
import { db } from './../config.js';

const { host, database, user, password } = db;

export default (async () => {
  const url = password ? `mongodb://${user}:${password}@${host}/${database}` : `mongodb://${host}/${database}`;
  const client = await MongoClient.connect(
    url,
    { useNewUrlParser: true }
  );
  const db = client.db(database);
  return { client, db };
});
