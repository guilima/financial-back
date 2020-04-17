import MongoClient from "mongodb";
import { Pool } from "pg";
import { MongoDBURI, postgresURI } from '../config';
const pool = new Pool({
  connectionString: postgresURI
});
async function mongodb() {
  const client = await MongoClient.connect(
    MongoDBURI,
    { useNewUrlParser: true , useUnifiedTopology: true}
  );
  const db = client.db();
  return { client, db };
};

function postgres() {
  return pool;
};

export {
  mongodb,
  postgres
}
