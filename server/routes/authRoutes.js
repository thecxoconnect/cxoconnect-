import express from 'express';
import passport from 'passport';
import {
  manualAuth,
  verifyOTP,
  resendOTP,
  completeProfile,
  getMe,
  googleCallback
} from '../controllers/authController.js';
import { isAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Email Passwordless OTP Auth Flow
router.post('/manual', manualAuth);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Profile completion & authenticated user
router.post('/complete-profile', isAuth, completeProfile);
router.get('/me', isAuth, getMe);

// OAuth: Google (ONLY OAuth Provider Supported)
router.get(
  '/google',
  (req, res, next) => {
    const clientUrl = process.env.CLIENT_URL || 'https://cxoconnect.vercel.app';
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Google OAuth credentials not configured on server.')}`);
    }
    const state = req.query.state || 'member';
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state
    })(req, res, next);
  }
);
router.get(
  '/google/callback',
  (req, res, next) => {
    const clientUrl = process.env.CLIENT_URL || 'https://cxoconnect.vercel.app';
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent('Google OAuth credentials not configured on server.')}`);
    }
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${clientUrl}/login?error=google_auth_failed`
    })(req, res, next);
  },
  googleCallback
);

export default router;
