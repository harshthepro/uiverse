"use server";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined in the environment variables");
}

// Custom global interface (no `extends typeof globalThis`)
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Type-safe access to global object
const globalWithMongoose = global as unknown as { mongoose: MongooseCache };

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function connect() {
  if (globalWithMongoose.mongoose.conn) {
    return globalWithMongoose.mongoose.conn;
  }

  if (!globalWithMongoose.mongoose.promise) {
    globalWithMongoose.mongoose.promise = mongoose.connect(MONGODB_URI).then((mongoose) => mongoose);
  }

  globalWithMongoose.mongoose.conn = await globalWithMongoose.mongoose.promise;
  return globalWithMongoose.mongoose.conn;
}

export default connect;
