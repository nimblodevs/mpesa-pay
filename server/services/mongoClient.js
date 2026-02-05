const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || process.env.DATABASE_URL;
if (!uri) {
  throw new Error("Missing MONGODB_URI (or DATABASE_URL) for MongoDB connection.");
}

const client = new MongoClient(uri);
let connectionPromise;

async function getDb() {
  if (!connectionPromise) {
    connectionPromise = client.connect();
  }
  const connectedClient = await connectionPromise;
  const dbName = process.env.MONGODB_DB;
  return dbName ? connectedClient.db(dbName) : connectedClient.db();
}

module.exports = {
  getDb,
};
