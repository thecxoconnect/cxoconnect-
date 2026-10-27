import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isAuth, isAdmin, isMainAdmin, upload } from '../middleware/auth.js';
import { manualAuth, verifyOTP, resendOTP, completeProfile, getMe } from '../controllers/authController.js';
import { isSuperAdminEmail } from '../config/constants.js';

// Setup MongoDB connection for test runner
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cxo_connect_test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

test.before(async () => {
  await mongoose.connect(MONGO_URI);
  await User.deleteMany({});
});

test.after(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

test('1. Data Model (models/User.js) specifications', async (t) => {
  await t.test('Creates user with default roles, statuses and OTP fields', async () => {
    const user = new User({
      email: 'testuser@executive.com'
    });
    await user.save();

    assert.equal(user.email, 'testuser@executive.com');
    assert.equal(user.role, 'member');
    assert.equal(user.isMainAdmin, false);
    assert.equal(user.status, 'pending');
    assert.equal(user.profileComplete, false);
    assert.equal(user.isEmailVerified, false);
    assert.equal(user.otp, null);
    assert.equal(user.otpExpires, null);
  });

  await t.test('toSafeJSON does not expose OTP or otpExpires', async () => {
    const user = new User({
      email: 'safeuser@executive.com',
      otp: '654321',
      otpExpires: new Date(Date.now() + 600000)
    });
    await user.save();

    const safeObj = user.toSafeJSON();
    assert.equal(safeObj.otp, undefined);
    assert.equal(safeObj.otpExpires, undefined);
    assert.equal(safeObj.email, 'safeuser@executive.com');
  });
});

test('2. Middleware Guards (middleware/auth.js) specifications', async (t) => {
  await t.test('isAuth: rejects request missing Bearer token', async () => {
    let statusCode = null;
    let jsonBody = null;
    const req = { headers: {} };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => { jsonBody = body; }
        };
      }
    };
    let nextCalled = false;

    await isAuth(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false);
    assert.equal(statusCode, 401);
    assert.equal(jsonBody.success, false);
  });

  await t.test('isAuth: verifies token and attaches user to req.user', async () => {
    const user = await User.create({ email: 'authtoken@example.com' });
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

    const req = { headers: { authorization: `Bearer ${token}` } };
    const res = {};
    let nextCalled = false;

    await isAuth(req, res, () => { nextCalled = true; });

    assert.equal(nextCalled, true);
    assert.ok(req.user);
    assert.equal(req.user.email, 'authtoken@example.com');
  });

  await t.test('isAdmin: enforces role === "admin" AND status === "accepted"', () => {
    let nextCalled = false;
    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      }
    };

    // Case 1: Member -> 403
    let req = { user: { role: 'member', status: 'accepted' } };
    isAdmin(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);

    // Case 2: Admin but pending -> 403
    req = { user: { role: 'admin', status: 'pending' } };
    isAdmin(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);

    // Case 3: Admin AND accepted -> 200 / next()
    nextCalled = false;
    req = { user: { role: 'admin', status: 'accepted' } };
    isAdmin(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });

  await t.test('isMainAdmin: enforces role === "admin" AND isMainAdmin === true', () => {
    let nextCalled = false;
    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      }
    };

    // Case 1: Admin but isMainAdmin = false -> 403
    let req = { user: { role: 'admin', isMainAdmin: false } };
    isMainAdmin(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, false);
    assert.equal(statusCode, 403);

    // Case 2: Admin and isMainAdmin = true -> next()
    nextCalled = false;
    req = { user: { role: 'admin', isMainAdmin: true } };
    isMainAdmin(req, res, () => { nextCalled = true; });
    assert.equal(nextCalled, true);
  });

  await t.test('upload: multer memory storage with 5MB limit', () => {
    assert.ok(upload);
    assert.equal(upload.limits.fileSize, 5 * 1024 * 1024);
  });
});

test('3. Auth Controllers (controllers/authController.js) specifications', async (t) => {
  let superAdminTempToken = null;
  let superAdminOtp = null;
  let sessionToken = null;

  await t.test('manualAuth: Super Admin whitelisted email forces role="admin", status="accepted", isMainAdmin=true', async () => {
    const superAdminEmail = 'theanvisharma@gmail.com';
    assert.equal(isSuperAdminEmail(superAdminEmail), true);

    const req = {
      body: { email: superAdminEmail, role: 'member' }
    };
    let jsonResponse = null;
    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => { jsonResponse = body; }
        };
      }
    };

    await manualAuth(req, res);

    assert.equal(statusCode, 200);
    assert.equal(jsonResponse.success, true);
    assert.ok(jsonResponse.token);
    superAdminTempToken = jsonResponse.token;

    // Check user in DB
    const userInDb = await User.findOne({ email: superAdminEmail });
    assert.ok(userInDb);
    assert.equal(userInDb.role, 'admin');
    assert.equal(userInDb.status, 'accepted');
    assert.equal(userInDb.isMainAdmin, true);
    assert.ok(userInDb.otp);
    assert.equal(userInDb.otp.length, 6);
    assert.ok(userInDb.otpExpires > new Date());
    superAdminOtp = userInDb.otp;

    // Verify 15-minute verification JWT payload
    const decoded = jwt.verify(superAdminTempToken, process.env.JWT_SECRET);
    assert.equal(decoded.purpose, 'otp_verification');
    assert.equal(decoded.email, superAdminEmail);
  });

  await t.test('verifyOTP: Validates OTP and verification token, clears OTP, sets isEmailVerified=true, issues 30d session JWT', async () => {
    const req = {
      body: {
        otp: superAdminOtp,
        token: superAdminTempToken
      },
      headers: {}
    };

    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => { jsonResponse = body; }
        };
      }
    };

    await verifyOTP(req, res);

    assert.equal(statusCode, 200);
    assert.equal(jsonResponse.success, true);
    assert.ok(jsonResponse.token);
    sessionToken = jsonResponse.token;

    // Check DB state
    const userInDb = await User.findOne({ email: 'theanvisharma@gmail.com' });
    assert.equal(userInDb.otp, null);
    assert.equal(userInDb.otpExpires, null);
    assert.equal(userInDb.isEmailVerified, true);

    // Verify 30-day session token
    const decodedSession = jwt.verify(sessionToken, process.env.JWT_SECRET);
    assert.equal(decodedSession.purpose, 'session');
    assert.equal(decodedSession.role, 'admin');
    assert.equal(decodedSession.isMainAdmin, true);
  });

  await t.test('resendOTP: Re-issues fresh 6-digit OTP and updates expiry', async () => {
    const req = {
      body: { email: 'theanvisharma@gmail.com' },
      headers: {}
    };

    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => { jsonResponse = body; }
        };
      }
    };

    await resendOTP(req, res);

    assert.equal(statusCode, 200);
    assert.equal(jsonResponse.success, true);

    const userInDb = await User.findOne({ email: 'theanvisharma@gmail.com' });
    assert.ok(userInDb.otp);
    assert.equal(userInDb.otp.length, 6);
    assert.ok(userInDb.otpExpires > new Date());
  });

  await t.test('completeProfile: Protected endpoint updates metadata and sets profileComplete=true', async () => {
    const userInDb = await User.findOne({ email: 'theanvisharma@gmail.com' });
    const req = {
      user: userInDb,
      body: {
        name: 'Anvi Sharma',
        company: 'CXO Connect Global',
        position: 'Managing Director',
        city: 'New Delhi',
        pincode: '110001',
        phone: '+91 9876543210',
        linkedin: 'https://linkedin.com/in/anvisharma'
      }
    };

    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => { jsonResponse = body; }
        };
      }
    };

    await completeProfile(req, res);

    assert.equal(statusCode, 200);
    assert.equal(jsonResponse.success, true);
    assert.equal(jsonResponse.user.profileComplete, true);
    assert.equal(jsonResponse.user.company, 'CXO Connect Global');
    assert.equal(jsonResponse.user.city, 'New Delhi');
  });

  await t.test('getMe: Protected endpoint returns user profile payload', async () => {
    const userInDb = await User.findOne({ email: 'theanvisharma@gmail.com' });
    const req = { user: userInDb };

    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (body) => { jsonResponse = body; }
        };
      }
    };

    await getMe(req, res);

    assert.equal(statusCode, 200);
    assert.equal(jsonResponse.success, true);
    assert.equal(jsonResponse.user.email, 'theanvisharma@gmail.com');
    assert.equal(jsonResponse.user.role, 'admin');
    assert.equal(jsonResponse.user.isMainAdmin, true);
  });
});
