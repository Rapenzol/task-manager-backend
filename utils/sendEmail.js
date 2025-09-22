const nodemailer = require("nodemailer");

async function sendEmail(to, subject, text) {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"My App" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log("✅ Email sent");
  } catch (error) {
    console.error("❌ Email Error:", error);
  }
}

module.exports = sendEmail;
