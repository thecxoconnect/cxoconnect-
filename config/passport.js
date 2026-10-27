import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as LinkedInStrategy } from 'passport-linkedin-oauth2';

/**
 * Configure Passport strategies for Google and LinkedIn OAuth
 */
export const configurePassport = () => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL,
    LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET,
    LINKEDIN_CALLBACK_URL
  } = process.env;

  // Configure Google OAuth 2.0 Strategy if credentials exist
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
          passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            // Extract google profile
            const email = profile.emails?.[0]?.value?.toLowerCase();
            const name = profile.displayName || `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim();
            const profileImage = profile.photos?.[0]?.value || '';
            const googleId = profile.id;

            req.googleProfile = {
              googleId,
              email,
              name,
              profileImage
            };

            return done(null, req.googleProfile);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
    console.log('[Passport] Google OAuth strategy registered.');
  } else {
    console.log('[Passport] GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing. Google OAuth disabled.');
  }

  // Configure LinkedIn OAuth 2.0 Strategy if credentials exist
  if (LINKEDIN_CLIENT_ID && LINKEDIN_CLIENT_SECRET) {
    passport.use(
      new LinkedInStrategy(
        {
          clientID: LINKEDIN_CLIENT_ID,
          clientSecret: LINKEDIN_CLIENT_SECRET,
          callbackURL: LINKEDIN_CALLBACK_URL || '/api/auth/linkedin/callback',
          scope: ['r_emailaddress', 'r_liteprofile'],
          passReqToCallback: true
        },
        async (req, accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value?.toLowerCase();
            const name = profile.displayName || '';
            const profileImage = profile.photos?.[0]?.value || '';
            const linkedinId = profile.id;

            req.linkedinProfile = {
              linkedinId,
              email,
              name,
              profileImage
            };

            return done(null, req.linkedinProfile);
          } catch (err) {
            return done(err, null);
          }
        }
      )
    );
    console.log('[Passport] LinkedIn OAuth strategy registered.');
  } else {
    console.log('[Passport] LINKEDIN_CLIENT_ID or LINKEDIN_CLIENT_SECRET missing. LinkedIn OAuth disabled.');
  }

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((obj, done) => {
    done(null, obj);
  });
};
