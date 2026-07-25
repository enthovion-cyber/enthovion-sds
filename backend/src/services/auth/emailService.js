const nodemailer = require('nodemailer');
const env = require('../../config/env');

let transporter;

const getTransporter = () => {
  if (transporter) return transporter;

  if (env.email.smtp.host && env.email.smtp.user) {
    transporter = nodemailer.createTransport({
      host: env.email.smtp.host,
      port: env.email.smtp.port,
      secure: env.email.smtp.port === 465,
      auth: {
        user: env.email.smtp.user,
        pass: env.email.smtp.pass,
      },
    });
  } else {
    // Fallback: log to console in dev if no SMTP configured
    transporter = nodemailer.createTransport({ jsonTransport: true });
    console.warn('⚠️  No SMTP configured. Emails will be logged to console.');
  }

  return transporter;
};

const sendEmail = async ({ to, subject, html }) => {
  const t = getTransporter();
  const info = await t.sendMail({
    from: env.email.from,
    to,
    subject,
    html,
  });

  if (env.isDev) {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    if (info.message) console.log('[EMAIL DEV]', JSON.parse(info.message).text);
  }

  return info;
};

const sendOtpEmail = async (to, otp, name = 'there') => {
  await sendEmail({
    to,
    subject: 'Your SafeSheet AI password reset code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a">Password Reset Request</h2>
        <p>Hi ${name},</p>
        <p>Use the following code to reset your password. It expires in <strong>${env.otp.expiryMinutes} minutes</strong>.</p>
        <div style="background:#f4f4f4;border-radius:8px;padding:24px;text-align:center;margin:24px 0">
          <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1a1a1a">${otp}</span>
        </div>
        <p style="color:#666;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
        <p style="color:#666;font-size:13px">— SafeSheet AI</p>
      </div>
    `,
  });
};

const sendVerifyEmail = async (to, verifyToken, name = 'there') => {
  const verifyUrl = `${env.frontendUrl}/en/verify-email?token=${verifyToken}`;
  await sendEmail({
    to,
    subject: 'Verify your SafeSheet AI email address',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a">Welcome to SafeSheet AI</h2>
        <p>Hi ${name},</p>
        <p>Please verify your email address to activate your account.</p>
        <div style="text-align:center;margin:32px 0">
          <a href="${verifyUrl}"
             style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500">
            Verify Email Address
          </a>
        </div>
        <p style="color:#666;font-size:13px">This link expires in 24 hours.</p>
        <p style="color:#666;font-size:13px">Or copy this link: ${verifyUrl}</p>
        <p style="color:#666;font-size:13px">— SafeSheet AI</p>
      </div>
    `,
  });
};

const sendWelcomeEmail = async (to, name = 'there') => {
  await sendEmail({
    to,
    subject: 'Welcome to SafeSheet AI — Your account is ready',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:24px">
        <h2 style="color:#1a1a1a">You're all set, ${name}!</h2>
        <p>Your SafeSheet AI account is verified and ready to use.</p>
        <p>You can now:</p>
        <ul style="color:#444;line-height:2">
          <li>Generate GHS-compliant SDS documents in minutes</li>
          <li>Import and manage your existing SDS library</li>
          <li>Run AI compliance audits on your documents</li>
          <li>Generate SOPs in English and Arabic</li>
        </ul>
        <div style="text-align:center;margin:32px 0">
          <a href="${env.frontendUrl}/en/dashboard"
             style="background:#1a1a1a;color:#fff;padding:14px 28px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:500">
            Go to Dashboard
          </a>
        </div>
        <p style="color:#666;font-size:13px">— SafeSheet AI</p>
      </div>
    `,
  });
};

module.exports = { sendOtpEmail, sendVerifyEmail, sendWelcomeEmail };
