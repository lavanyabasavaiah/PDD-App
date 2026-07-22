import nodemailer from 'nodemailer';

let transporter = null;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Check if standard SMTP settings are defined in environment variables (for production / user setup)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('Using configured SMTP mailer.');
    return transporter;
  }

  // Fallback to dynamic free Ethereal Email account
  try {
    console.log('No SMTP config found. Generating free Ethereal test account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log(`Ethereal Email SMTP initialized successfully.`);
    console.log(`Ethereal User: ${testAccount.user}`);
    return transporter;
  } catch (error) {
    console.error('Failed to create Ethereal SMTP transporter:', error);
    return null;
  }
};

export const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: '"VitalTrack AI Support" <support@vitaltrack.org>',
    to: email,
    subject: 'VitalTrack Password Reset OTP',
    html: `
      <div style="font-family: sans-serif; padding: 24px; max-width: 600px; margin: auto; background-color: #0a0c16; color: #f8fafc; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #6366f1; font-size: 24px; margin: 0; font-weight: bold;">VitalTrack</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">AI Smart Health Monitoring Platform</p>
        </div>
        <div style="background-color: rgba(22, 28, 54, 0.55); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 12px; padding: 24px; text-align: center;">
          <p style="font-size: 16px; margin: 0 0 16px 0; color: #94a3b8;">You requested a password reset. Use the One-Time Password (OTP) below to reset your password. This OTP is valid for 10 minutes.</p>
          <div style="display: inline-block; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #6366f1; padding: 12px 24px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.2); margin-bottom: 16px;">
            ${otp}
          </div>
          <p style="font-size: 12px; color: #64748b; margin: 0;">If you did not request this, please ignore this email or contact support.</p>
        </div>
      </div>
    `,
  };

  const currentTransporter = await getTransporter();
  
  if (currentTransporter) {
    try {
      const info = await currentTransporter.sendMail(mailOptions);
      console.log(`[EMAIL SENT] OTP to ${email}: ${otp}`);
      // If using Ethereal, log preview URL
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log(`==================================================`);
        console.log(`[ETHEREAL INBOX] View email preview at:`);
        console.log(`${previewUrl}`);
        console.log(`==================================================`);
      }
      return { success: true, previewUrl };
    } catch (err) {
      console.error('Nodemailer error sending email:', err);
    }
  }

  // Fallback: log to console if nodemailer fails or offline
  console.log(`==================================================`);
  console.log(`[OFFLINE FALLBACK] Could not send real email.`);
  console.log(`Sent Password Reset OTP to: ${email}`);
  console.log(`OTP Code: ${otp}`);
  console.log(`==================================================`);
  return { success: false, fallback: true };
};
