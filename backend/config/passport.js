import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User  from '../models/User.js';


// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id); // Only storing the user ID in the session
});

// Deserialize user to retrieve from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Client ID from your Google Cloud Console
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Client Secret from your Google Cloud Console
      callbackURL: '/api/auth/google/callback', // Endpoint for Google to redirect back
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });
        
        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            isVerified: true // Google accounts are already verified
          });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
