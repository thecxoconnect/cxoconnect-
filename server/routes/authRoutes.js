import express from 'express';
import passport from 'passport';
import {
  manualAuth,
  verifyOTP,
  resendOTP,
  completeProfile,
  getMe,
  linkedinCallback,
  googleCallback
} from '../controllers/authController.js';
import { isAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Email OTP Auth
router.post('/manual', manualAuth);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// Profile completion & current user
router.post('/complete-profile', isAuth, completeProfile);
router.get('/me', isAuth, getMe);

// OAuth: LinkedIn
router.get(
  '/linkedin',
  passport.authenticate('linkedin', { scope: ['openid', 'profile', 'email'] })
);
router.get(
  '/linkedin/callback',
  passport.authenticate('linkedin', { session: false, failureRedirect: '/login?error=linkedin_auth_failed' }),
  linkedinCallback
);

// OAuth: Google
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
  googleCallback
);

export default router;
