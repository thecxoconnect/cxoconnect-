import { connectDB } from '../config/db.js';

export const dbMiddleware = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ success: false, error: 'Database Connection Failed', message: err.message });
  }
};

export default dbMiddleware;

