import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  // Handle both user object and user ID
  const id = typeof userId === 'object' ? userId._id : userId;
  
  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
