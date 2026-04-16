import { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/mongodb.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password, role } = request.body;

    if (!email || !password || !role) {
      return response.status(400).json({ message: 'Missing required fields' });
    }

    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    // AUTO-SEED: If database is empty, seed it automatically
    const count = await usersCollection.countDocuments();
    if (count === 0) {
      console.log('Database empty, performing auto-seed...');
      const demoUsers = [
        {
          name: 'Sarah Johnson',
          email: 'sarah@techwave.io',
          role: 'entrepreneur',
          avatarUrl: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg',
          bio: 'Serial entrepreneur with 10+ years of experience in SaaS and fintech.',
          startupName: 'TechWave AI',
          pitchSummary: 'AI-powered financial analytics platform helping SMBs make data-driven decisions.',
          fundingNeeded: '$1.5M',
          industry: 'FinTech',
          location: 'San Francisco, CA',
          foundedYear: 2021,
          teamSize: 12,
          isOnline: true,
          createdAt: new Date().toISOString()
        },
        {
          name: 'Michael Rodriguez',
          email: 'michael@vcinnovate.com',
          role: 'investor',
          avatarUrl: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg',
          bio: 'Early-stage investor with focus on B2B SaaS and fintech. Previously founded and exited two startups.',
          investmentInterests: ['FinTech', 'SaaS', 'AI/ML'],
          investmentStage: ['Seed', 'Series A'],
          portfolioCompanies: ['PayStream', 'DataSense', 'CloudSecure'],
          totalInvestments: 12,
          minimumInvestment: '$250K',
          maximumInvestment: '$1.5M',
          isOnline: true,
          createdAt: new Date().toISOString()
        }
      ];

      for (const demoUser of demoUsers) {
        const hashedPassword = await bcrypt.hash('password123', 12);
        await usersCollection.insertOne({ ...demoUser, password: hashedPassword });
      }
      console.log('Auto-seed completed.');
    }

    // Find user
    const user = await usersCollection.findOne({ email, role });
    if (!user) {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return response.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return response.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        ...userWithoutPassword
      }
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ 
      message: 'Internal server error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    });
  }
}
