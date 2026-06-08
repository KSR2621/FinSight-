import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import connectDB from '../lib/mongodb';
import { User } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

export default async function handler(req: any, res: any) {
  try {
  await connectDB();

  const { method } = req;
  const path = req.url.split('/').pop();

  if (method === 'POST') {
    if (req.url.includes('/signup')) {
      try {
        const { email, password, displayName } = req.body;
        const existingUser = await (User as any).findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ email, password: hashedPassword, displayName });
        await user.save();

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
        res.status(201).json({ token, user: { uid: user._id, email: user.email, displayName: user.displayName } });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
      }
    } else if (req.url.includes('/login')) {
      try {
        const { email, password } = req.body;
        const user = await (User as any).findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
        res.json({ token, user: { uid: user._id, email: user.email, displayName: user.displayName } });
      } catch (error) {
        res.status(500).json({ error: 'Failed to login' });
      }
    } else {
      res.status(404).json({ error: 'Not Found' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
  } catch (error: any) {
    console.error('Auth API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
