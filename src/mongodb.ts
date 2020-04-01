import MongoClient from "mongodb";
import { MongoDBURI } from '../config';

export default (async () => {
  const client = await MongoClient.connect(
    MongoDBURI,
    { useNewUrlParser: true , useUnifiedTopology: true}
  );
  const db = client.db();
  return { client, db };
});
