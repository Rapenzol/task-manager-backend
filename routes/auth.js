const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/user");
const router = express.Router();
const sgMail = require("@sendgrid/mail");

const otpStore = {};

// ✅ Direct OTP function
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Set SendGrid API Key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ✅ Send OTP for Registration
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const otp = generateOtp();
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
  };

  try {
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM, // Verified SendGrid sender
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      html: `<strong>Your OTP is ${otp}</strong>`,
      mailSettings: { sandboxMode: { enable: false } } 
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error.response?.body || error);
    res.status(500).json({ message: "Failed to send OTP", error: error.response?.body || error });
  }
});

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // Check OTP validity
    if (!otpStore[email] || otp !== otpStore[email]?.otp || Date.now() > otpStore[email].expiresAt) {
      return res.status(400).json({ message: "OTP invalid or expired!" });
    }

    // Remove OTP after use
    delete otpStore[email];

    // Email format check
    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email format!" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: password.trim(), // Schema will hash it
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("❌ Signup Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password.trim(), user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
