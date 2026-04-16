import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'admin';

if (!uri) {
  throw new Error('Missing MONGODB_URI in .env');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db(dbName).command({ ping: 1 });
    console.log(`Pinged MongoDB database "${dbName}" successfully.`);
  } finally {
    await client.close();
  }
}

run().catch((err) => {
  console.error('MongoDB connection failed:', err);
  process.exit(1);
});
