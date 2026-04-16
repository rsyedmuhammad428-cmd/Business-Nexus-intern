import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

// Import our Vercel handlers
import loginHandler from './api/auth/login.js';
import registerHandler from './api/auth/register.js';
import meHandler from './api/auth/me.js';

dotenv.config();

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Log requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Map local routes to the Vercel-style handlers
app.post('/api/auth/login', loginHandler);
app.post('/api/auth/register', registerHandler);
app.get('/api/auth/me', meHandler);

// Basic health check / ping
app.get('/api/ping', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
    });
    await client.connect();
    await client.db().command({ ping: 1 });
    await client.close();
    res.json({ message: 'MongoDB connection successful' });
  } catch (err) {
    res.status(500).json({ message: 'MongoDB connection failed', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 API Dev Server running at http://localhost:${PORT}`);
  console.log(`📡 Use 'npm run dev' to start the full application (Frontend + Backend)`);
});
