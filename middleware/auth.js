import jwt from 'jsonwebtoken';
import multer from 'multer';
import User from '../models/User.js';

/**
 * Authentication Middleware:
 * Reads JWT from Authorization: Bearer <token>, verifies signature,
 * fetches user from DB and attaches to req.user.
 */
export const isAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization denied. Bearer token missing in Authorization header.'
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Malformed authorization token.'
      });
    }

    const secret = process.env.JWT_SECRET || 'cxo_connect_default_secret_key';
    const decoded = jwt.verify(token, secret);

    // Fetch user from database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User belonging to this token no longer exists.'
      });
    }

    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please log in again.'
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authorization token.',
      error: error.message
    });
  }
};

/**
 * Admin Guard Middleware:
 * Enforces role === 'admin' AND status === 'accepted'
 */
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required prior to admin check.'
    });
  }

  if (req.user.role === 'admin' && (req.user.status === 'accepted' || req.user.status === 'approved')) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires admin role with accepted status.',
    currentRole: req.user.role,
    currentStatus: req.user.status
  });
};

/**
 * Main Admin Guard Middleware:
 * Enforces role === 'admin' AND isMainAdmin === true
 */
export const isMainAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required prior to main admin check.'
    });
  }

  if (req.user.role === 'admin' && req.user.isMainAdmin === true) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Access denied: Requires main super admin privileges.',
    isMainAdmin: req.user.isMainAdmin
  });
};

/**
 * File Upload Middleware using multer.memoryStorage()
 * Restricted to images under 5MB.
 */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Allow only images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image files (JPEG, PNG, WEBP, GIF, SVG) are allowed!'), false);
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB in bytes
  },
  fileFilter
});

/**
 * Helper middleware wrapper to cleanly catch Multer errors (e.g. 5MB exceeded)
 */
export const handleSingleUpload = (fieldName = 'profileImage') => {
  const single = upload.single(fieldName);
  return (req, res, next) => {
    single(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Image size exceeds maximum allowed limit of 5MB.'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error.'
        });
      }
      next();
    });
  };
};
