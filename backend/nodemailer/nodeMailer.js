import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Gmail credentials from environment variables
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_PASS;

// Create a Nodemailer transporter for Gmail
export const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: GMAIL_USER, // Your Gmail address
        pass: GMAIL_PASS, // Your App Password
    },
});

// Define the sender information
export const sender = {
    email: GMAIL_USER,
    name: "Ikram Afgar",
};
