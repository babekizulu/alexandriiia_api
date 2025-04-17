const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, 
  },
  // Add TLS options if needed, e.g., for self-signed certificates
  // tls: {
  //   rejectUnauthorized: false
  // }
});

const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
    to: to,
    subject: 'Password Reset Request',
    text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
    html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p><p>Please click on the following link, or paste this into your browser to complete the process:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: %s', info.messageId);
    // Preview only available when sending through an Ethereal account
    if (process.env.NODE_ENV !== 'production' && nodemailer.getTestMessageUrl(info)) {
         console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email.');
  }
};

module.exports = { sendPasswordResetEmail }; 