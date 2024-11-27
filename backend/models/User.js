import { Schema, model } from "mongoose";

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleId: { type: String },
  githubId: { type: String },
});

export default model("User", userSchema);
