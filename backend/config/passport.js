import { serializeUser, deserializeUser, use } from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User, { findById, findOne } from "../models/User";

serializeUser((user, done) => {
  done(null, user.id);
});

deserializeUser(async (id, done) => {
  try {
    const user = await findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findOne({ googleId: profile.id });
        if (!user) {
          user = new User({ googleId: profile.id, email: profile.emails[0].value });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await findOne({ githubId: profile.id });
        if (!user) {
          user = new User({ githubId: profile.id, email: profile.emails[0].value });
          await user.save();
        }
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
