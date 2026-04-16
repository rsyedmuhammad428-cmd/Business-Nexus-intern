import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { entrepreneurs, investors } from '../src/data/users.ts';

dotenv.config();

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('Please add your MONGODB_URI to .env');
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const usersCollection = db.collection('users');

    // Combine users and prepare for insertion
    const allMockUsers = [...entrepreneurs, ...investors];
    
    console.log(`Preparing to seed ${allMockUsers.length} users...`);

    for (const user of allMockUsers) {
      // Check if user already exists
      const existing = await usersCollection.findOne({ email: user.email });
      if (existing) {
        console.log(`User ${user.email} already exists, skipping.`);
        continue;
      }

      // Hash default password 'password123' for all mock users
      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const newUser = {
        ...user,
        password: hashedPassword,
        _id: undefined, // Let MongoDB generate ID
      };

      await usersCollection.insertOne(newUser);
      console.log(`Seeded: ${user.name} (${user.role})`);
    }

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seed();
