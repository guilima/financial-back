import MongoClient from "mongodb";
import { mongodbURI } from '../config';

export const mongodb = async() => {
  const client = await MongoClient.connect(
    mongodbURI,
    { useNewUrlParser: true , useUnifiedTopology: true}
  );
  const db = client.db();
  return { client, db };
};