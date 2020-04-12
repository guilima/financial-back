import MongoClient from "mongodb";
import { MongoDBURI } from '../config';

export async function dbConnection() {
  const client = await MongoClient.connect(
    MongoDBURI,
    { useNewUrlParser: true , useUnifiedTopology: true}
  );
  const db = client.db();
  return { client, db };
};
