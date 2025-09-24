import React, { useState } from "react";
import "./Register.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();

  // ✅ Send OTP function
  const sendOtp = async () => {
    if (!email) {
      alert("Enter email first!");
      return;
    }

    try {
      const res = await axios.post(
        "https://task-manager-backend-production-e3a6.up.railway.app/api/auth/send-otp",
        { email: email.trim().toLowerCase() }
      );
      alert(res.data.message || "OTP sent to your email!");
      setOtpSent(true); // OTP sent successfully
    } catch (err) {
      console.error("Send OTP error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to send OTP");
    }
  };

  // ✅ Signup function
  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address!");
      return;
    }

    if (!otpSent) {
      alert("Please request OTP first!");
      return;
    }

    if (!otp) {
      alert("Please enter the OTP!");
      return;
    }

    try {
      const res = await axios.post(
        "https://task-manager-backend-production-e3a6.up.railway.app/api/auth/signup",
        {
          name,
          email: email.trim().toLowerCase(),
          password: password.trim(),
          otp: otp.trim(),
        }
      );
      alert(res.data.message || "Registration successful!");
      navigate("/login"); // Redirect to login page
    } catch (err) {
      console.error("Signup error:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Registration failed!");
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Register</h2>

        <label>Name</label>
        <input
          type="text"
          placeholder="Enter full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <label>Email</label>
        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* OTP field only shows after OTP is sent */}
        {otpSent && (
          <>
            <label>OTP</label>
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </>
        )}

        <button
          type="button"
          onClick={sendOtp}
          disabled={otpSent} // Disable button after sending OTP
        >
          {otpSent ? "OTP Sent" : "Send OTP"}
        </button>

        <button type="submit">Register</button>

        <p className="login-link">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
    </div>
  );
};

export default Register;
