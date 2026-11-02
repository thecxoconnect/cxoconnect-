import { connectDB } from '../config/db.js';

export const ensureDbConnected = async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection middleware error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Database Connection Failed',
      message: error.message
    });
  }
};

export const dbMiddleware = ensureDbConnected;
export default ensureDbConnected;
