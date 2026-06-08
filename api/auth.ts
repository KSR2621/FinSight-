import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

export default async function handler(req: any, res: any) {
  try {
    console.log(`Auth API received ${req.method} request for ${req.url}`);

    await connectDB();

    const { method } = req;
    const url = req.url || '';

    if (method === 'POST') {
      if (url.includes('/signup')) {
        try {
          const { email, password, displayName } = req.body;
          if (!email || !password) {
             return res.status(400).json({ error: 'Email and password are required' });
          }

          const existingUser = await (User as any).findOne({ email });
          if (existingUser) return res.status(400).json({ error: 'User already exists' });

          const hashedPassword = await bcrypt.hash(password, 10);
          const user = new User({ email, password: hashedPassword, displayName });
          await user.save();

          const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
          return res.status(201).json({ token, user: { uid: user._id, email: user.email, displayName: user.displayName } });
        } catch (error: any) {
          console.error('Signup Error:', error);
          return res.status(500).json({ error: 'Failed to create user: ' + (error.message || 'Unknown error') });
        }
      } else if (url.includes('/login')) {
        try {
          const { email, password } = req.body;
          if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
          }

          const user = await (User as any).findOne({ email });
          if (!user) return res.status(400).json({ error: 'Invalid credentials' });

          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) return res.status(400).json({ error: 'Invalid credentials' });

          const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
          return res.json({ token, user: { uid: user._id, email: user.email, displayName: user.displayName } });
        } catch (error: any) {
          console.error('Login Error:', error);
          return res.status(500).json({ error: 'Failed to login: ' + (error.message || 'Unknown error') });
        }
      } else {
        return res.status(404).json({ error: 'Auth endpoint not found: ' + url });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('Auth API Global Error:', error);
    return res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
