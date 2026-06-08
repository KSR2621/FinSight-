import jwt from 'jsonwebtoken';
import connectDB from '../lib/mongodb.ts';
import { Bill } from '../models/Bill.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

const authenticate = (req: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, JWT_SECRET) as any;
};

export default async function handler(req: any, res: any) {
  await connectDB();

  let user;
  try {
    user = authenticate(req);
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method, query } = req;
  const id = query.path ? query.path[0] : null;

  switch (method) {
    case 'GET':
      try {
        const bills = await Bill.find({ userId: user.userId });
        res.json(bills.map(b => ({ ...b.toObject(), id: b._id })));
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bills' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
