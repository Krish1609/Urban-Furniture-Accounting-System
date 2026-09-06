import 'dotenv/config';
import nodemailer from 'nodemailer';

// Configure SMTP Transporter using FurniLedger credentials
const smtpUser = process.env.SMTP_USER || 'furniledger@gmail.com';
const smtpPass = (process.env.SMTP_PASS || 'yjwdlcfchcswcqjr').replace(/\s+/g, '');
const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = Number(process.env.SMTP_PORT) || 465;
const smtpSecure = process.env.SMTP_SECURE !== 'false'; // true for 465, false for 587
const smtpFrom = process.env.SMTP_FROM || `"FurniLedger Accounting" <${smtpUser}>`;

export const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: smtpUser,
    pass: smtpPass
  },
  tls: {
    rejectUnauthorized: false // Allow secure transmission
  }
});

/**
 * Verify SMTP connection
 */
export const verifyTransporter = async () => {
  try {
    await transporter.verify();
    console.log(`📧 SMTP Server connection verified successfully for ${smtpUser}`);
    return true;
  } catch (err) {
    console.error('❌ SMTP Connection Error:', err.message);
    return false;
  }
};

/**
 * Send Password Reset OTP Email
 */
export const sendPasswordResetOtpEmail = async ({ toEmail, userName = 'User', otpCode }) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>FurniLedger Password Reset</title>
      <style>
        body { margin: 0; padding: 0; background-color: #0E0D0C; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EDE8DF; }
        .container { max-width: 580px; margin: 30px auto; background: #181614; border: 1px solid #332F2A; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { background: linear-gradient(135deg, #1F1C18 0%, #12100E 100%); padding: 32px 28px; text-align: center; border-bottom: 2px solid #D4AF37; }
        .logo-title { font-family: 'Georgia', serif; font-size: 24px; font-weight: 700; color: #D4AF37; letter-spacing: 0.05em; margin: 0; }
        .logo-sub { font-size: 11px; text-transform: uppercase; letter-spacing: 0.18em; color: #A8A29E; margin-top: 6px; }
        .content { padding: 36px 32px; }
        .greeting { font-size: 18px; font-weight: 600; color: #FFFFFF; margin-bottom: 12px; }
        .text { font-size: 14px; line-height: 1.6; color: #C5BFB5; margin-bottom: 24px; }
        .otp-box { background: #23201C; border: 1px dashed #D4AF37; border-radius: 10px; padding: 22px; text-align: center; margin: 28px 0; }
        .otp-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: #A8A29E; margin-bottom: 8px; }
        .otp-code { font-family: 'Courier New', monospace; font-size: 38px; font-weight: 800; color: #D4AF37; letter-spacing: 0.25em; margin: 4px 0; }
        .otp-expiry { font-size: 12px; color: #F59E0B; margin-top: 8px; font-weight: 500; }
        .security-notice { background: rgba(245, 158, 11, 0.08); border-left: 3px solid #F59E0B; padding: 14px 16px; border-radius: 4px; font-size: 12px; color: #E5D5BA; line-height: 1.5; margin-bottom: 24px; }
        .footer { background: #12100E; padding: 22px; text-align: center; font-size: 11px; color: #78716C; border-top: 1px solid #28241F; }
        .footer a { color: #D4AF37; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="logo-title">FURNILEDGER</h1>
          <div class="logo-sub">Urban Furniture ERP & Accounting System</div>
        </div>
        <div class="content">
          <div class="greeting">Hello, ${userName}</div>
          <p class="text">
            We received a request to reset the password for your FurniLedger account. Use the one-time verification code (OTP) below to authorize the password reset:
          </p>

          <div class="otp-box">
            <div class="otp-label">Password Reset One-Time Passcode</div>
            <div class="otp-code">${otpCode}</div>
            <div class="otp-expiry">⏱ This OTP is valid for 10 minutes only</div>
          </div>

          <div class="security-notice">
            <strong>Security Reminder:</strong> Never share this code with anyone. FurniLedger administrators or support staff will never ask for your password or OTP.
          </div>

          <p class="text" style="font-size: 12px; color: #8C8275;">
            If you did not request a password reset, you can safely disregard this email. Your current password will remain unchanged and secure.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Urban Furniture & FurniLedger Accounting Systems.<br>
          Ahmedabad, Gujarat, India • <a href="mailto:furniledger@gmail.com">furniledger@gmail.com</a>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: smtpFrom,
    to: toEmail,
    subject: `🔐 ${otpCode} is your FurniLedger Password Reset Code`,
    text: `Your FurniLedger password reset OTP code is: ${otpCode}. It is valid for 10 minutes. If you did not request this, please ignore this email.`,
    html: htmlContent
  };

  const info = await transporter.sendMail(mailOptions);
  return info;
};
