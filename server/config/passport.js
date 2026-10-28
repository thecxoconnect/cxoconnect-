import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

export const configurePassport = () => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CALLBACK_URL
  } = process.env;

  // Google OAuth 2.0 Strategy
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
    console.log('[Passport] Google OAuth Strategy initialized.');
  }
};

configurePassport();

export default passport;
