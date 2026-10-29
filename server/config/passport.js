import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import { User } from '../models/User.js';

dotenv.config();

const SUPER_ADMIN_EMAILS = (process.env.SUPER_ADMIN_EMAILS || '')
  .split(',')
  .map(e => e.trim().toLowerCase());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : null;
          if (!email) return done(new Error('No email returned from Google'), null);

          req.googleProfile = {
            id: profile.id,
            email,
            name: profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
            photo: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
            intendedRole: req.query.state || 'member'
          };

          return done(null, profile);
        } catch (err) {
          return done(err, null);
        }
      }
    )
  );
  console.log('[Passport] Google OAuth Strategy registered successfully.');
} else {
  console.warn('⚠️ Google OAuth credentials missing in environment variables.');
}

export default passport;
