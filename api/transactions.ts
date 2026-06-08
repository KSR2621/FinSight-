import jwt from 'jsonwebtoken';
import connectDB from '../lib/mongodb.ts';
import { Transaction } from '../models/Transaction.ts';

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
        const transactions = await Transaction.find({ userId: user.userId }).sort({ date: -1 });
        res.json(transactions.map(t => ({ ...t.toObject(), id: t._id })));
      } catch (error) {
        res.status(500).json({ error: 'Failed to fetch transactions' });
      }
      break;
    case 'POST':
      try {
        const newTransaction = new Transaction({ ...req.body, userId: user.userId });
        await newTransaction.save();
        res.status(201).json({ ...newTransaction.toObject(), id: newTransaction._id });
      } catch (error) {
        res.status(500).json({ error: 'Failed to create transaction' });
      }
      break;
    case 'PUT':
      try {
        const updatedTransaction = await Transaction.findOneAndUpdate(
          { _id: id, userId: user.userId },
          req.body,
          { new: true }
        );
        if (updatedTransaction) {
          res.json({ ...updatedTransaction.toObject(), id: updatedTransaction._id });
        } else {
          res.status(404).json({ error: 'Transaction not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to update transaction' });
      }
      break;
    case 'DELETE':
      try {
        const result = await Transaction.findOneAndDelete({ _id: id, userId: user.userId });
        if (result) {
          res.status(204).send();
        } else {
          res.status(404).json({ error: 'Transaction not found' });
        }
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete transaction' });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${method} Not Allowed`);
  }
}
