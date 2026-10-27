import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import User from '../models/User.js';
import {
  memberLogin,
  applyMembership,
  activateAccount,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';

const MONGO_URI = process.env.MONGO_URI_TEST || 'mongodb://127.0.0.1:27017/cxo_connect_network_test';
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';

test.before(async () => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_URI);
  }
});

test.after(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
});

test('CXO Network Membership Flow Tests', async (t) => {
  const testEmail = 'exec.applicant@fortune500.com';

  await t.test('applyMembership: Validates required fields and creates pending application', async () => {
    await User.deleteOne({ email: testEmail });

    const req = {
      body: {
        name: 'Siddharth Rao',
        email: testEmail,
        designation: 'Chief Technology Officer',
        company: 'Fortune 500 Enterprise',
        linkedin: 'https://linkedin.com/in/siddharth-rao',
        areasOfInterest: ['AI & Tech Transformation', 'C-Suite Strategy & Governance'],
        termsAccepted: true
      }
    };

    let statusCode = null;
    let jsonRes = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (b) => { jsonRes = b; } };
      }
    };

    await applyMembership(req, res);

    assert.equal(statusCode, 201);
    assert.equal(jsonRes.success, true);
    assert.equal(jsonRes.heading, 'Thank you for your interest.');

    const userInDb = await User.findOne({ email: testEmail });
    assert.ok(userInDb);
    assert.equal(userInDb.status, 'pending');
    assert.equal(userInDb.company, 'Fortune 500 Enterprise');
    assert.equal(userInDb.areasOfInterest.length, 2);
  });

  await t.test('memberLogin: Returns 403 pending approval message when status is pending', async () => {
    const req = {
      body: {
        email: testEmail,
        password: 'AnyPassword123!'
      }
    };

    let statusCode = null;
    let jsonRes = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (b) => { jsonRes = b; } };
      }
    };

    await memberLogin(req, res);

    assert.equal(statusCode, 403);
    assert.equal(jsonRes.status, 'pending');
    assert.equal(jsonRes.message, 'Your application is under review. We will email you once a decision is made.');
  });

  await t.test('activateAccount: Activates membership with valid token and sets password', async () => {
    const userInDb = await User.findOne({ email: testEmail });
    userInDb.activationToken = 'test-activation-token-9988';
    userInDb.activationExpires = new Date(Date.now() + 3600000);
    await userInDb.save();

    const req = {
      body: {
        token: 'test-activation-token-9988',
        password: 'SecureMemberPass2026!'
      }
    };

    let statusCode = null;
    let jsonRes = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (b) => { jsonRes = b; } };
      }
    };

    await activateAccount(req, res);

    assert.equal(statusCode, 200);
    assert.equal(jsonRes.success, true);
    assert.ok(jsonRes.token); // Issues session token

    const activatedUser = await User.findOne({ email: testEmail });
    assert.equal(activatedUser.status, 'approved');
    assert.equal(activatedUser.activationToken, null);
  });

  await t.test('memberLogin: Successfully logs in approved member with password', async () => {
    const req = {
      body: {
        email: testEmail,
        password: 'SecureMemberPass2026!'
      }
    };

    let statusCode = null;
    let jsonRes = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (b) => { jsonRes = b; } };
      }
    };

    await memberLogin(req, res);

    assert.equal(statusCode, 200);
    assert.equal(jsonRes.success, true);
    assert.ok(jsonRes.token);
    assert.equal(jsonRes.user.email, testEmail);
  });

  await t.test('forgotPassword & resetPassword: Sends reset link and updates password', async () => {
    // 1. Forgot password
    const reqForgot = { body: { email: testEmail } };
    let jsonForgot = null;
    const resForgot = {
      status: (code) => ({ json: (b) => { jsonForgot = b; } })
    };
    await forgotPassword(reqForgot, resForgot);
    assert.equal(jsonForgot.success, true);

    const userWithReset = await User.findOne({ email: testEmail });
    assert.ok(userWithReset.resetPasswordToken);

    // 2. Reset password
    const reqReset = {
      body: {
        token: userWithReset.resetPasswordToken,
        password: 'BrandNewPassword2026!'
      }
    };
    let statusCodeReset = null;
    let jsonReset = null;
    const resReset = {
      status: (code) => {
        statusCodeReset = code;
        return { json: (b) => { jsonReset = b; } };
      }
    };
    await resetPassword(reqReset, resReset);

    assert.equal(statusCodeReset, 200);
    assert.equal(jsonReset.success, true);

    // 3. Login with new password
    const reqNewLogin = {
      body: {
        email: testEmail,
        password: 'BrandNewPassword2026!'
      }
    };
    let statusNewLogin = null;
    let jsonNewLogin = null;
    const resNewLogin = {
      status: (code) => {
        statusNewLogin = code;
        return { json: (b) => { jsonNewLogin = b; } };
      }
    };
    await memberLogin(reqNewLogin, resNewLogin);
    assert.equal(statusNewLogin, 200);
    assert.equal(jsonNewLogin.success, true);
  });
});
