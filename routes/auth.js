const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/user");
const router = express.Router();
// const nodemailer = require("nodemailer");
const sgMail = require("@sendgrid/mail");
const otpStore = {};

// ✅ Direct OTP function define karo yaha
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Send OTP for Registration
// router.post("/send-otp", async (req, res) => {
//   const { email } = req.body;

//   if (!email || !validator.isEmail(email)) {
//     return res.status(400).json({ message: "Invalid email" });
//   }

//   // OTP generate
//   const otp = generateOtp();
//   otpStore[email] = {
//     otp,
//     expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes
//   };

//   try {
//     // Email bhejo
//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       port: 465,
//       secure: true,
//       auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//       },
//     });

//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Your OTP Code",
//       text: `Your OTP is ${otp}`,
//     });

//     res.json({ message: "OTP sent to your email" });
//   } catch (error) {
//     console.error("❌ Error sending OTP:", error);
//     res.status(500).json({ message: "Failed to send OTP" });
//   }
// });
router.post("/send-otp", async (req, res) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email" });
  }

  const otp = generateOtp();
  otpStore[email] = {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  try {
    await sgMail.send({
      to: email,
      from: process.env.EMAIL_FROM,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      mailSettings: {
        sandboxMode: {
          enable: false // true for testing, false to send real email
        }
      }
    });

    res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("❌ Error sending OTP:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
});

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // Check OTP validity
    if (
      !otpStore[email] ||
      otp !== otpStore[email]?.otp ||
      Date.now() > otpStore[email].expiresAt
    ) {
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

    // Just save the plain password, schema hook will hash it
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: password.trim(),
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
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("Entered Password:", password.trim());
    console.log("Stored Hashed Password:", user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

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
