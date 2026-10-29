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
    const state = req.query.state || 'member';
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state
    })(req, res, next);
  }
);
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=google_auth_failed' }),
  googleCallback
);

export default router;
