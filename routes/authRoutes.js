import { Router } from 'express';
import passport from 'passport';
import {
  memberLogin,
  applyMembership,
  activateAccount,
  forgotPassword,
  resetPassword,
  manualAuth,
  googleCallback,
  linkedinCallback,
  verifyOTP,
  resendOTP,
  completeProfile,
  getMe
} from '../controllers/authController.js';
import { isAuth, handleSingleUpload } from '../middleware/auth.js';

const router = Router();

// 1. Core Authentication for The CXO Network
router.post('/login', memberLogin);
router.post('/apply', applyMembership);
router.post('/activate', activateAccount);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// 2. OTP Authentication Flows
router.post('/manual', manualAuth);
router.post('/verify-otp', verifyOTP);
router.post('/resend-otp', resendOTP);

// 3. Member Profile Endpoints
router.post('/complete-profile', isAuth, handleSingleUpload('profileImage'), completeProfile);
router.put('/complete-profile', isAuth, handleSingleUpload('profileImage'), completeProfile);
router.get('/me', isAuth, getMe);

// 4. OAuth Routes (Google & LinkedIn)
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'Google OAuth credentials not configured. Please use Email/Password or mock OAuth.'
    });
  }
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })(req, res, next);
});

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', { session: false, failureRedirect: '/#login?error=GoogleAuthFailed' })(req, res, next);
  },
  googleCallback
);

router.get('/linkedin', (req, res, next) => {
  if (!process.env.LINKEDIN_CLIENT_ID || !process.env.LINKEDIN_CLIENT_SECRET) {
    return res.status(503).json({
      success: false,
      message: 'LinkedIn OAuth credentials not configured. Please use Email/Password or mock OAuth.'
    });
  }
  passport.authenticate('linkedin', { session: false })(req, res, next);
});

router.get(
  '/linkedin/callback',
  (req, res, next) => {
    passport.authenticate('linkedin', { session: false, failureRedirect: '/#login?error=LinkedInAuthFailed' })(req, res, next);
  },
  linkedinCallback
);

// 5. Mock OAuth helper for QA/Dev
router.post('/mock-oauth', async (req, res, next) => {
  const { provider = 'google', email, name, profileImage, id } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Mock email is required.' });
  }

  const mockProfile = {
    email,
    name: name || (provider === 'google' ? 'Google Executive' : 'LinkedIn Executive'),
    profileImage: profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    ...(provider === 'google' ? { googleId: id || `mock-google-${Date.now()}` } : { linkedinId: id || `mock-linkedin-${Date.now()}` })
  };

  if (provider === 'google') {
    req.googleProfile = mockProfile;
    return googleCallback(req, res);
  } else {
    req.linkedinProfile = mockProfile;
    return linkedinCallback(req, res);
  }
});

export default router;
