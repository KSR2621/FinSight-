import type { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb';
import { User } from '../models/User';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-super-secret-key-change-this';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  try {
    console.log(`Auth API received ${req.method} request for ${req.url}`);

    await connectDB();

    const { method, query } = req;
    const url = req.url || '';
    const path = Array.isArray(query.path) ? query.path[0] : query.path;

    if (method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      return res
        .status(405)
        .json({ error: `Method ${method} Not Allowed` });
    }

    if (!req.body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // SIGNUP
    if (url.includes('/signup') || path === 'signup') {
      const { email, password, displayName } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      const existingUser = await User.findOne({ email });

      if (existingUser) {
        return res.status(400).json({
          error: 'User already exists',
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        email,
        password: hashedPassword,
        displayName,
      });

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        JWT_SECRET
      );

      return res.status(201).json({
        token,
        user: {
          uid: user._id.toString(),
          email: user.email,
          displayName: user.displayName,
        },
      });
    }

    // LOGIN
    if (url.includes('/login') || path === 'login') {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ error: 'Email and password are required' });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({
          error: 'Invalid credentials',
        });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(400).json({
          error: 'Invalid credentials',
        });
      }

      const token = jwt.sign(
        {
          userId: user._id.toString(),
          email: user.email,
        },
        JWT_SECRET
      );

      return res.json({
        token,
        user: {
          uid: user._id.toString(),
          email: user.email,
          displayName: user.displayName,
        },
      });
    }

    return res.status(404).json({
      error: `Auth endpoint not found: ${url}`,
    });
  } catch (error: any) {
    console.error('Auth API Error:', error);

    return res.status(500).json({
      error: error.message || 'Internal Server Error',
    });
  }
}
