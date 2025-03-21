import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User  from '../models/User.js';
import Profile from '../models/Profile.js';


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
        // First check if user already exists with this email address
        const email = profile.emails[0].value;
        let user = await User.findOne({ email: email });
        
        // If user exists but has a password and no googleId, then it was created through email/password
        if (user && user.password && !user.googleId) {
          // This is an existing email/password account
          const error = new Error('Email already exists. Please login with email & password.');
          error.existingAccount = true;
          return done(error);
        }
        
        // Otherwise, check if user exists with Google ID
        if (!user) {
          user = await User.findOne({ googleId: profile.id });
        }
        
        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            isVerified: true // Google accounts are already verified
          });
          
          // Create a profile for the Google user
          const userProfile = new Profile({
            user: user._id,
            // Default empty values for profile fields
            skillsToLearn: [],
            skillsToTeach: []
          });
          await userProfile.save();
          
          // Link the profile to the user
          user.profile = userProfile._id;
          await user.save();
        } else if (!user.googleId) {
          // User exists with email but doesn't have googleId, update it
          user.googleId = profile.id;
          await user.save();
        }
        
        // If user exists but doesn't have a profile, create one
        if (!user.profile) {
          const userProfile = new Profile({
            user: user._id,
            skillsToLearn: [],
            skillsToTeach: []
          });
          await userProfile.save();
          
          user.profile = userProfile._id;
          await user.save();
        }
        
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
