import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { sendOtpEmail } from '../config/email.js';
import { connectDB } from '../config/db.js';

const SUPER_ADMINS = ['admin@cxoconnect.com', 'theanvisharma@gmail.com'];

const isSuperAdminEmail = (email) => {
  if (!email) return false;
  const list = [...SUPER_ADMINS];
  if (process.env.SUPER_ADMIN_EMAILS) {
    list.push(...process.env.SUPER_ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()));
  }
  return list.includes(email.trim().toLowerCase());
};

/**
 * 1. manualAuth
 * Accept { email, role }. Super admin force role='admin', status='accepted', isMainAdmin=true.
 * 6-digit numeric OTP (10 mins), Nodemailer HTML template, 15-minute verification JWT.
 */
export const manualAuth = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid executive email address.'
      });
    }

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is currently unavailable. Please check MongoDB Atlas credentials & IP access.',
        error: 'Database offline'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isSuperAdmin = isSuperAdminEmail(normalizedEmail);

    let user = await User.findOne({ email: normalizedEmail });

    if (user) {
      if (isSuperAdmin) {
        user.role = 'admin';
        user.status = 'accepted';
        user.isMainAdmin = true;
      } else if (role && !['admin'].includes(user.role)) {
        user.role = role === 'admin' ? 'admin' : 'member';
      }
    } else {
      user = new User({
        email: normalizedEmail,
        role: isSuperAdmin ? 'admin' : (role === 'admin' ? 'admin' : 'member'),
        status: isSuperAdmin ? 'accepted' : 'pending',
        isMainAdmin: isSuperAdmin
      });
    }

    // Generate 6-digit numeric OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // Send branded Nodemailer OTP
    await sendOtpEmail(user.email, otp, user.name || 'Executive Leader');

    // Return 15-minute verification JWT
    const secret = process.env.JWT_SECRET || 'cxo_connect_super_secret_jwt_key_2026_production_grade';
    const tempToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        purpose: 'otp_verification'
      },
      secret,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been dispatched to ${user.email}. It expires in 10 minutes.`,
      token: tempToken,
      email: user.email,
      role: user.role,
      isSuperAdmin: user.isMainAdmin,
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp })
    });
  } catch (error) {
    console.error('[manualAuth Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to initiate authentication.',
      error: error.message
    });
  }
};

/**
 * 2. verifyOTP
 * Validate OTP and verification token. Clear OTP, mark isEmailVerified = true, issue 30-day session JWT.
 */
export const verifyOTP = async (req, res) => {
  try {
    const { otp, token: bodyToken } = req.body;

    let token = bodyToken;
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Verification token and 6-digit OTP code are required.'
      });
    }

    const secret = process.env.JWT_SECRET || 'cxo_connect_super_secret_jwt_key_2026_production_grade';
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Verification token has expired or is invalid.'
      });
    }

    if (decoded.purpose !== 'otp_verification') {
      return res.status(400).json({
        success: false,
        message: 'Invalid token purpose. Expected otp_verification token.'
      });
    }

    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database connection is temporarily unavailable. Please try again shortly.',
        error: 'Database offline'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found.'
      });
    }

    if (!user.otp || user.otp !== String(otp).trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP code. Please check and try again.'
      });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please request a fresh code.'
      });
    }

    // Clear OTP and verify email
    user.otp = null;
    user.otpExpires = null;
    user.isEmailVerified = true;
    await user.save();

    // Issue 30-day session JWT
    const sessionToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        isMainAdmin: user.isMainAdmin,
        status: user.status,
        purpose: 'session'
      },
      secret,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.',
      token: sessionToken,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[verifyOTP Error]', error);
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed.',
      error: error.message
    });
  }
};

/**
 * 3. resendOTP
 * Re-issue fresh OTP and update expiry to current user.
 */
export const resendOTP = async (req, res) => {
  try {
    const { email, token: bodyToken } = req.body;
    let token = bodyToken;
    const authHeader = req.headers.authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    let user = null;
    const secret = process.env.JWT_SECRET || 'cxo_connect_super_secret_jwt_key_2026_production_grade';

    if (token) {
      try {
        const decoded = jwt.verify(token, secret, { ignoreExpiration: true });
        if (decoded.userId) user = await User.findById(decoded.userId);
      } catch (err) {}
    }

    if (!user && email) {
      user = await User.findOne({ email: email.trim().toLowerCase() });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Unable to identify user. Please provide a valid email or verification token.'
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, user.name || 'Executive Leader');

    const newTempToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        purpose: 'otp_verification'
      },
      secret,
      { expiresIn: '15m' }
    );

    return res.status(200).json({
      success: true,
      message: `Fresh 6-digit OTP dispatched to ${user.email}.`,
      token: newTempToken,
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp })
    });
  } catch (error) {
    console.error('[resendOTP Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend verification code.',
      error: error.message
    });
  }
};

/**
 * 4. completeProfile
 * Protected endpoint to update user metadata and set profileComplete = true.
 */
export const completeProfile = async (req, res) => {
  try {
    const user = req.user;
    const { name, phone, company, position, city, pincode, linkedin, profileImage } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (company !== undefined) user.company = company.trim();
    if (position !== undefined) user.position = position.trim();
    if (city !== undefined) user.city = city.trim();
    if (pincode !== undefined) user.pincode = pincode.trim();
    if (linkedin !== undefined) user.linkedin = linkedin.trim();

    if (req.file) {
      const base64Data = req.file.buffer.toString('base64');
      user.profileImage = `data:${req.file.mimetype};base64,${base64Data}`;
    } else if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    user.profileComplete = true;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Executive profile completed successfully.',
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[completeProfile Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update executive profile.',
      error: error.message
    });
  }
};

/**
 * 5. getMe
 * Protected endpoint returning user profile payload.
 */
export const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user.toSafeJSON()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch executive profile.',
      error: error.message
    });
  }
};

/**
 * 6. OAuth Callbacks (Google OAuth 2.0)
 */
const handleOAuthCallback = async (req, res, provider, profile) => {
  try {
    const email = profile.email || (profile.emails && profile.emails[0]?.value);
    const name = profile.name || profile.displayName || '';
    const profileImage = profile.profileImage || profile.photo || (profile.photos && profile.photos[0]?.value) || '';
    const googleId = profile.googleId || profile.id;
    const intendedRole = profile.intendedRole || req.query.state || 'member';
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (!email) {
      return res.redirect(`${clientUrl}/login?error=EmailNotProvidedByProvider`);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isSuperAdmin = isSuperAdminEmail(normalizedEmail);

    let query = { email: normalizedEmail };
    if (provider === 'google' && googleId) {
      query = { $or: [{ googleId }, { email: normalizedEmail }] };
    }

    let user = await User.findOne(query);

    if (user) {
      if (isSuperAdmin) {
        user.role = 'admin';
        user.status = 'accepted';
        user.isMainAdmin = true;
      }
      if (provider === 'google' && googleId) user.googleId = googleId;
      if (name && !user.name) user.name = name;
      if (profileImage && !user.profileImage) user.profileImage = profileImage;
    } else {
      user = new User({
        email: normalizedEmail,
        name: name || '',
        profileImage: profileImage || '',
        googleId: provider === 'google' ? googleId : undefined,
        role: isSuperAdmin ? 'admin' : (intendedRole === 'admin' ? 'admin' : 'member'),
        status: isSuperAdmin ? 'accepted' : 'pending',
        isMainAdmin: isSuperAdmin
      });
    }

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, user.name || 'Executive Leader');

    const secret = process.env.JWT_SECRET || 'cxo_connect_super_secret_jwt_key_2026_production_grade';
    const tempToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        purpose: 'otp_verification',
        provider
      },
      secret,
      { expiresIn: '15m' }
    );

    return res.redirect(`${clientUrl}/verify-otp?token=${encodeURIComponent(tempToken)}&email=${encodeURIComponent(user.email)}`);
  } catch (error) {
    console.error(`[${provider}Callback Error]`, error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error.message)}`);
  }
};

export const googleCallback = async (req, res) => {
  const profile = req.googleProfile || req.user;
  return handleOAuthCallback(req, res, 'google', profile);
};
