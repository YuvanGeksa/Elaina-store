import { MongoClient } from "mongodb";
import config from "../config.js";

let cached = global._mongoClient;

if (!cached) {
  cached = global._mongoClient = { client: null, promise: null };
}

export async function getMongoClient() {
  if (cached.client) return cached.client;

  if (!cached.promise) {
    const uri = config.mongodb.uri;
    if (!uri || uri.includes("MONGODB_URI_HERE")) {
      throw new Error("MongoDB URI belum di-set di config.js (config.mongodb.uri).");
    }
    cached.promise = new MongoClient(uri, {
      maxPoolSize: 10,
    }).connect();
  }
  cached.client = await cached.promise;
  return cached.client;
}

export async function getDb() {
  const client = await getMongoClient();
  return client.db(config.mongodb.dbName);
}
