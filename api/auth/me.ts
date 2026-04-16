import { VercelRequest, VercelResponse } from '@vercel/node';
import clientPromise from '../lib/mongodb';
import { ObjectId } from 'mongodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

export default async function handler(
  request: VercelRequest,
  response: VercelResponse
) {
  if (request.method !== 'GET') {
    return response.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.userId) });
    if (!user) {
      return response.status(404).json({ message: 'User not found' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    return response.status(200).json({
      user: {
        id: user._id.toString(),
        ...userWithoutPassword
      }
    });
  } catch (error) {
    console.error(error);
    return response.status(401).json({ message: 'Invalid or expired token' });
  }
}
