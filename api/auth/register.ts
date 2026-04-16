import { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/mongodb.js';
import bcrypt from 'bcryptjs';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'POST') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { name, email, password, role } = request.body;

    if (!name || !email || !password || !role) {
      return response.status(401).json({ 
      message: 'Invalid or expired token',
      error: 'Missing required fields' 
    });
  }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return response.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
      bio: '',
      isOnline: true,
      createdAt: new Date().toISOString(),
    };

    const result = await db.collection('users').insertOne(newUser);
    
    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return response.status(201).json({
      message: 'User created successfully',
      user: {
        id: result.insertedId.toString(),
        ...userWithoutPassword
      }
    });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
}
