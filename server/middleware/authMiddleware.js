import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * isAuth: Validates 30-day session JWT Bearer token
 */
export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing Bearer token in Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Malformed authorization token.'
      });
    }

    const secret = process.env.JWT_SECRET || 'cxo_connect_super_secret_jwt_key_2026_production_grade';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or no longer active.'
      });
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Session expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization token signature.',
      error: error.message
    });
  }
};

/**
 * isAdmin: Requires role === 'admin' AND status === 'accepted'
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role === 'admin' && req.user.status === 'accepted') {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires administrator credentials with accepted status.',
    currentRole: req.user.role,
    currentStatus: req.user.status
  });
};

/**
 * isMainAdmin: Requires role === 'admin' AND isMainAdmin === true
 */
export const isMainAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role === 'admin' && req.user.isMainAdmin === true) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires main super administrator privileges.'
  });
};
