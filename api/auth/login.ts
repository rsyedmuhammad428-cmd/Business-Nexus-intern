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
          _id: 'e1',
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
          _id: 'e2',
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
          createdAt: new Date().toISOString()
        },
        {
          _id: 'e3',
          name: 'Maya Patel',
          email: 'maya@healthpulse.com',
          role: 'entrepreneur',
          avatarUrl: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg',
          bio: 'Former healthcare professional with an MBA. Building tech to improve patient care.',
          startupName: 'HealthPulse',
          pitchSummary: 'Mobile platform connecting patients with mental health professionals in real-time.',
          fundingNeeded: '$800K',
          industry: 'HealthTech',
          location: 'Boston, MA',
          foundedYear: 2022,
          teamSize: 5,
          isOnline: true,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'e4',
          name: 'James Wilson',
          email: 'james@urbanfarm.io',
          role: 'entrepreneur',
          avatarUrl: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg',
          bio: 'Agricultural engineer focused on urban farming solutions and food security.',
          startupName: 'UrbanFarm',
          pitchSummary: 'IoT-enabled vertical farming systems for urban environments and food deserts.',
          fundingNeeded: '$3M',
          industry: 'AgTech',
          location: 'Chicago, IL',
          foundedYear: 2019,
          teamSize: 14,
          isOnline: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'i1',
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
        },
        {
          _id: 'i2',
          name: 'Jennifer Lee',
          email: 'jennifer@impactvc.org',
          role: 'investor',
          avatarUrl: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
          bio: 'Impact investor focused on climate tech, sustainable agriculture, and clean energy.',
          investmentInterests: ['CleanTech', 'AgTech', 'Sustainability'],
          investmentStage: ['Seed', 'Series A', 'Series B'],
          portfolioCompanies: ['SolarFlow', 'EcoPackage', 'CleanWater Solutions'],
          totalInvestments: 18,
          minimumInvestment: '$500K',
          maximumInvestment: '$3M',
          isOnline: false,
          createdAt: new Date().toISOString()
        },
        {
          _id: 'i3',
          name: 'Robert Torres',
          email: 'robert@healthventures.com',
          role: 'investor',
          avatarUrl: 'https://images.pexels.com/photos/834863/pexels-photo-834863.jpeg',
          bio: 'Healthcare-focused investor with medical background. Looking for innovations in patient care and biotech.',
          investmentInterests: ['HealthTech', 'BioTech', 'Medical Devices'],
          investmentStage: ['Series A', 'Series B'],
          portfolioCompanies: ['MediTrack', 'BioGenics', 'Patient+'],
          totalInvestments: 9,
          minimumInvestment: '$1M',
          maximumInvestment: '$5M',
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
