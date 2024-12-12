import passport, { serializeUser, deserializeUser, use } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User";


// Serialize user to store in session
serializeUser((user, done) => {
  done(null, user.id); // Only storing the user ID in the session
});

// Deserialize user to retrieve from session
deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy Configuration
use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Client ID from your Google Cloud Console
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Client Secret from your Google Cloud Console
      callbackURL: "/auth/google/callback", // Endpoint for Google to redirect back
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await findOne({ googleId: profile.id });
        if (!user) {
          // Create a new user if not found
          user = new User({
            googleId: profile.id,
            email: profile.emails[0].value, // Primary email from Google profile
            name: profile.displayName, // Display name from Google profile
          });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

export default passport;
