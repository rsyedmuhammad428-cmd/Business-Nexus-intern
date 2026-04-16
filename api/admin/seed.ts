import { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/mongodb.js';
import bcrypt from 'bcryptjs';

const entrepreneurs = [
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
    createdAt: '2023-01-15T09:24:00Z'
  },
  {
    name: 'David Chen',
    email: 'david@greenlife.co',
    role: 'entrepreneur',
    avatarUrl: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg',
    bio: 'Environmental scientist turned entrepreneur. Passionate about sustainable solutions.',
    startupName: 'GreenLife Solutions',
    pitchSummary: 'Biodegradable packaging alternatives for consumer goods and food industry.',
    fundingNeeded: '$2M',
    industry: 'CleanTech',
    location: 'Portland, OR',
    foundedYear: 2020,
    teamSize: 8,
    isOnline: false,
    createdAt: '2022-03-10T14:35:00Z'
  }
];

const investors = [
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
    createdAt: '2020-05-18T10:15:00Z'
  }
];

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    const allMockUsers = [...entrepreneurs, ...investors];
    const results = [];

    for (const user of allMockUsers) {
      const existing = await usersCollection.findOne({ email: user.email });
      if (existing) {
        results.push({ email: user.email, status: 'already_exists' });
        continue;
      }

      const hashedPassword = await bcrypt.hash('password123', 12);
      
      const newUser = {
        ...user,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      await usersCollection.insertOne(newUser);
      results.push({ email: user.email, status: 'seeded' });
    }

    return response.status(200).json({
      message: 'Cloud Seeding Completed',
      results
    });
  } catch (error: any) {
    console.error(error);
    return response.status(500).json({ message: 'Cloud seeding failed', error: error.message });
  }
}
