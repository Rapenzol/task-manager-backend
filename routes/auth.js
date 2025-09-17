const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const User = require("../models/user");
const router = express.Router();

// ✅ Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, otp } = req.body;

    // Check OTP validity
    if (
      !otpStore[email] ||
      parseInt(otp) !== otpStore[email]?.otp ||
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
    res.status(500).json({ message: "Server error", error });
  }
});

// Login Route
// ✅ Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Step 1: Check required fields
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Step 2: Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Step 3: Compare password
    const isMatch = await bcrypt.compare(password.trim(), user.password);
    console.log("Entered Password:", password.trim());
    console.log("Stored Hashed Password:", user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Step 4: Generate JWT Token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Step 5: Send Response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

module.exports = router;
