import jwt from 'jsonwebtoken';
import connectDB from '../lib/mongodb';
import { Goal } from '../models/Goal';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-this';

const authenticate = (req: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) throw new Error('Unauthorized');
  return jwt.verify(token, JWT_SECRET) as any;
};

export default async function handler(req: any, res: any) {
  try {
  await connectDB();

  let user;
  try {
    user = authenticate(req);
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { method, query } = req;
  const id = Array.isArray(query.path) ? query.path[0] : query.path;

  switch (method) {
    case 'GET':
      try {
        const goals = await (Goal as any).find({ userId: user.userId });
        res.json(goals.map(g => ({ ...g.toObject(), id: g._id.toString() })));
      } catch (error: any) {
        console.error('Fetch goals error:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch goals' });
      }
      break;
    case 'POST':
      try {
        if (!req.body) return res.status(400).json({ error: 'Request body is required' });
        const newGoal = new Goal({ ...req.body, userId: user.userId });
        await newGoal.save();
        res.status(201).json({ ...newGoal.toObject(), id: newGoal._id.toString() });
      } catch (error: any) {
        console.error('Create goal error:', error);
        res.status(500).json({ error: error.message || 'Failed to create goal' });
      }
      break;
    case 'PUT':
      try {
        if (!id) return res.status(400).json({ error: 'ID is required' });
        if (!req.body) return res.status(400).json({ error: 'Request body is required' });
        const updatedGoal = await (Goal as any).findOneAndUpdate(
          { _id: id, userId: user.userId },
          req.body,
          { new: true }
        );
        if (updatedGoal) {
          res.json({ ...updatedGoal.toObject(), id: updatedGoal._id.toString() });
        } else {
          res.status(404).json({ error: 'Goal not found' });
        }
      } catch (error: any) {
        console.error('Update goal error:', error);
        res.status(500).json({ error: error.message || 'Failed to update goal' });
      }
      break;
    case 'DELETE':
      try {
        const result = await (Goal as any).findOneAndDelete({ _id: id, userId: user.userId });
        if (result) {
          res.status(204).send();
        } else {
          res.status(404).json({ error: 'Goal not found' });
        }
      } catch (error: any) {
        console.error('Delete goal error:', error);
        res.status(500).json({ error: error.message || 'Failed to delete goal' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
  } catch (error: any) {
    console.error('Goals API Error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
