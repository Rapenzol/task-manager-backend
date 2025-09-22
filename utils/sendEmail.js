const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendEmail(to, subject, text) {
  try {
    await sgMail.send({
      to,
      from: process.env.EMAIL_FROM, // Verified SendGrid email
      subject,
      text,
      html: `<p>${text}</p>`
    });
    console.log("✅ Email sent via SendGrid");
  } catch (error) {
    console.error("❌ SendGrid Email Error:", error.response?.body || error);
  }
}

module.exports = sendEmail;
