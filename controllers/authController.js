import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { generateOtp } from '../utils/generateOtp.js';
import {
  sendOtpEmail,
  sendApplicationReceivedEmail,
  sendActivationEmail,
  sendPasswordResetEmail
} from '../config/mailer.js';
import { isSuperAdminEmail, JWT_CONFIG, OTP_CONFIG } from '../config/constants.js';

/**
 * 1. Member Login (Email & Password)
 * Form: Email address | Password with show/hide control
 * Error messages per spec:
 * - Unsuccessful login: "We couldn’t sign you in. Check your details or reset your password."
 * - Pending approval: "Your application is under review. We will email you once a decision is made."
 */
export const memberLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email address and password.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'We couldn’t sign you in. Check your details or reset your password.'
      });
    }

    // Check account status
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        status: 'pending',
        message: 'Your application is under review. We will email you once a decision is made.'
      });
    }

    if (user.status === 'declined' || user.status === 'rejected') {
      return res.status(403).json({
        success: false,
        status: 'declined',
        message: 'Your application was not approved at this time. Please contact our membership team for assistance.'
      });
    }

    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        status: 'inactive',
        message: 'Your account access has been deactivated. Please contact our membership team for support.'
      });
    }

    // Check if account has not set password yet
    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'You have been invited, but haven’t set your password yet. Please check your email to activate your account or use the activation link.'
      });
    }

    // Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'We couldn’t sign you in. Check your details or reset your password.'
      });
    }

    // Generate 30-day session token
    const secret = process.env.JWT_SECRET || 'cxo_connect_default_secret_key';
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
      { expiresIn: JWT_CONFIG.SESSION_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name || 'Executive'}!`,
      token: sessionToken,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[memberLogin Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication processing failed.',
      error: error.message
    });
  }
};

/**
 * 2. Apply for Membership
 * Fields: Full name, Work email, Designation, Company, LinkedIn, Areas of interest, Consent
 */
export const applyMembership = async (req, res) => {
  try {
    const {
      name,
      email,
      designation,
      position,
      company,
      linkedin,
      areasOfInterest,
      termsAccepted
    } = req.body;

    if (!name || !email || (!designation && !position) || !company) {
      return res.status(400).json({
        success: false,
        message: 'Full name, work email, designation, and company are required.'
      });
    }

    if (!termsAccepted) {
      return res.status(400).json({
        success: false,
        message: 'You must acknowledge the Privacy Policy and agree to the Terms of Membership.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(409).json({
          success: false,
          message: 'An application with this email is already under review. We will contact you once a decision is made.'
        });
      }
      return res.status(409).json({
        success: false,
        message: 'An account already exists for this email. Please log in or recover your password.'
      });
    }

    const isSuper = isSuperAdminEmail(normalizedEmail);

    const newUser = new User({
      name: name.trim(),
      email: normalizedEmail,
      designation: (designation || position).trim(),
      position: (position || designation).trim(),
      company: company.trim(),
      linkedin: linkedin ? linkedin.trim() : '',
      areasOfInterest: Array.isArray(areasOfInterest) ? areasOfInterest : [],
      termsAccepted: true,
      role: isSuper ? 'admin' : 'member',
      status: isSuper ? 'approved' : 'pending',
      isMainAdmin: isSuper,
      appliedAt: new Date()
    });

    await newUser.save();

    // Send acknowledgment email
    await sendApplicationReceivedEmail(newUser.email, newUser.name, newUser.company);

    return res.status(201).json({
      success: true,
      heading: 'Thank you for your interest.',
      message: 'We have received your application. Our membership team will review your details and contact you by email.'
    });
  } catch (error) {
    console.error('[applyMembership Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process application.',
      error: error.message
    });
  }
};

/**
 * 3. Activate Account
 * "Activate your membership" — Set password, confirm password, Activate Account.
 */
export const activateAccount = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Activation token and password are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const user = await User.findOne({
      activationToken: token,
      activationExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'The activation link is invalid or has expired. Please request a new activation link.'
      });
    }

    user.password = password;
    user.status = 'approved';
    user.isEmailVerified = true;
    user.profileComplete = true;
    user.activationToken = null;
    user.activationExpires = null;
    await user.save();

    // Auto-login upon activation
    const secret = process.env.JWT_SECRET || 'cxo_connect_default_secret_key';
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
      { expiresIn: JWT_CONFIG.SESSION_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: 'Your membership account is now activated! Welcome to The CXO Network.',
      token: sessionToken,
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[activateAccount Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to activate account.',
      error: error.message
    });
  }
};

/**
 * 4. Forgot Password (Request Reset Link)
 * Confirmation: "If an account exists for this email, we’ll send password reset instructions."
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your registered work email address.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
      const resetUrl = `${clientUrl}/#reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(user.email, user.name || 'Executive', resetUrl);
    }

    return res.status(200).json({
      success: true,
      message: 'If an account exists for this email, we’ll send password reset instructions.'
    });
  } catch (error) {
    console.error('[forgotPassword Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Password recovery request failed.',
      error: error.message
    });
  }
};

/**
 * 5. Reset Password (Execute Reset with Token)
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Reset token and new password are required.'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset link is invalid or has expired. Please request a new one.'
      });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'Your password has been reset successfully. You can now log in.'
    });
  } catch (error) {
    console.error('[resetPassword Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to reset password.',
      error: error.message
    });
  }
};

/**
 * 6. manualAuth (OTP Flow)
 */
export const manualAuth = async (req, res) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
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

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtpEmail(user.email, otp, user.name || 'Executive Member');

    const secret = process.env.JWT_SECRET || 'cxo_connect_default_secret_key';
    const tempToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        purpose: 'otp_verification'
      },
      secret,
      { expiresIn: JWT_CONFIG.VERIFICATION_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${user.email}. It expires in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
      token: tempToken,
      email: user.email,
      isSuperAdmin: user.isMainAdmin,
      role: user.role
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
 * 7. OAuth Callbacks (Google & LinkedIn)
 */
const handleOAuthCallback = async (req, res, provider, profile) => {
  try {
    const { email, name, profileImage, googleId, linkedinId } = profile;

    if (!email) {
      const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
      return res.redirect(`${clientUrl}/verify-otp?error=EmailNotProvidedByProvider`);
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isSuperAdmin = isSuperAdminEmail(normalizedEmail);

    let query = { email: normalizedEmail };
    if (provider === 'google' && googleId) {
      query = { $or: [{ googleId }, { email: normalizedEmail }] };
    } else if (provider === 'linkedin' && linkedinId) {
      query = { $or: [{ linkedinId }, { email: normalizedEmail }] };
    }

    let user = await User.findOne(query);

    if (user) {
      if (isSuperAdmin) {
        user.role = 'admin';
        user.status = 'accepted';
        user.isMainAdmin = true;
      }
      if (provider === 'google' && googleId) user.googleId = googleId;
      if (provider === 'linkedin' && linkedinId) user.linkedinId = linkedinId;
      if (name && !user.name) user.name = name;
      if (profileImage && !user.profileImage) user.profileImage = profileImage;
    } else {
      user = new User({
        email: normalizedEmail,
        name: name || '',
        profileImage: profileImage || '',
        googleId: provider === 'google' ? googleId : undefined,
        linkedinId: provider === 'linkedin' ? linkedinId : undefined,
        role: isSuperAdmin ? 'admin' : 'member',
        status: isSuperAdmin ? 'accepted' : 'pending',
        isMainAdmin: isSuperAdmin
      });
    }

    const otp = generateOtp();
    const otpExpires = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    await sendOtpEmail(user.email, otp, user.name || 'Executive Member');

    const secret = process.env.JWT_SECRET || 'cxo_connect_default_secret_key';
    const tempToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        purpose: 'otp_verification',
        provider
      },
      secret,
      { expiresIn: JWT_CONFIG.VERIFICATION_EXPIRY }
    );

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    return res.redirect(`${clientUrl}/verify-otp?token=${encodeURIComponent(tempToken)}`);
  } catch (error) {
    console.error(`[${provider}Callback Error]`, error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    return res.redirect(`${clientUrl}/verify-otp?error=${encodeURIComponent(error.message)}`);
  }
};

export const googleCallback = async (req, res) => {
  const profile = req.googleProfile || req.user;
  if (!profile) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    return res.redirect(`${clientUrl}/verify-otp?error=GoogleAuthFailed`);
  }
  return handleOAuthCallback(req, res, 'google', profile);
};

export const linkedinCallback = async (req, res) => {
  const profile = req.linkedinProfile || req.user;
  if (!profile) {
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5000';
    return res.redirect(`${clientUrl}/verify-otp?error=LinkedInAuthFailed`);
  }
  return handleOAuthCallback(req, res, 'linkedin', profile);
};

/**
 * 8. verifyOTP
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

    const secret = process.env.JWT_SECRET || 'cxo_connect_default_secret_key';
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
        message: 'Invalid token purpose.'
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
        message: 'OTP has expired. Please request a fresh one.'
      });
    }

    user.otp = null;
    user.otpExpires = null;
    user.isEmailVerified = true;
    await user.save();

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
      { expiresIn: JWT_CONFIG.SESSION_EXPIRY }
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
 * 9. resendOTP
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
    const secret = process.env.JWT_SECRET || 'cxo_connect_default_secret_key';

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

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);
    await user.save();

    await sendOtpEmail(user.email, otp, user.name || 'Executive Member');

    const newTempToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        purpose: 'otp_verification'
      },
      secret,
      { expiresIn: JWT_CONFIG.VERIFICATION_EXPIRY }
    );

    return res.status(200).json({
      success: true,
      message: `Fresh 6-digit OTP sent to ${user.email}. Expires in ${OTP_CONFIG.EXPIRY_MINUTES} minutes.`,
      token: newTempToken
    });
  } catch (error) {
    console.error('[resendOTP Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resend OTP.',
      error: error.message
    });
  }
};

/**
 * 10. completeProfile (Protected)
 */
export const completeProfile = async (req, res) => {
  try {
    const user = req.user;
    const {
      name,
      phone,
      company,
      designation,
      position,
      linkedin,
      city,
      pincode,
      areasOfInterest,
      profileImage
    } = req.body;

    if (name !== undefined) user.name = name.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (company !== undefined) user.company = company.trim();
    if (designation !== undefined || position !== undefined) {
      user.designation = (designation || position).trim();
      user.position = (position || designation).trim();
    }
    if (linkedin !== undefined) user.linkedin = linkedin.trim();
    if (city !== undefined) user.city = city.trim();
    if (pincode !== undefined) user.pincode = pincode.trim();
    if (areasOfInterest !== undefined) {
      user.areasOfInterest = Array.isArray(areasOfInterest)
        ? areasOfInterest
        : typeof areasOfInterest === 'string'
        ? areasOfInterest.split(',').map((s) => s.trim())
        : [];
    }

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
      message: 'Profile updated and marked as complete.',
      user: user.toSafeJSON()
    });
  } catch (error) {
    console.error('[completeProfile Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
      error: error.message
    });
  }
};

/**
 * 11. getMe (Protected)
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
      message: 'Failed to fetch user profile.',
      error: error.message
    });
  }
};
