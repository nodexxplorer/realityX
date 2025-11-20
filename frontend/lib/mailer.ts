import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com", // Gmail or your SMTP provider
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false, // use TLS
  auth: {
    user: process.env.SMTP_USER, // your email (e.g., Gmail)
    pass: process.env.SMTP_PASS, // app password or SMTP password
  },
});

/**
 * Send an email
 * @param to Recipient email
 * @param subject Subject line
 * @param html HTML body
 */
export async function sendMail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: `"DreamDAO" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    console.log("📨 Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send failed:", error);
    throw new Error("Failed to send email");
  }
}

/**
 * Helper to send a verification email with a token link
 */
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${token}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px; border:1px solid #ddd;">
      <h2>Verify your DreamDAO account</h2>
      <p>Click the button below to verify your email address and activate your account:</p>
      <a href="${verifyUrl}" style="display:inline-block; padding:10px 20px; margin-top:10px; background:#4f46e5; color:#fff; text-decoration:none; border-radius:6px;">
        Verify Account
      </a>
      <p>If you didn’t create an account, you can safely ignore this email.</p>
    </div>
  `;

  return sendMail(email, "Verify your DreamDAO account", html);
}

/**
 * Helper to send confirmation after successful verification
 */
export async function sendWelcomeEmail(email: string, name: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding:20px; border:1px solid #ddd;">
      <h2>Welcome to DreamDAO, ${name} 🎉</h2>
      <p>We’re excited to have you join DreamDao! Your account has been created successfully, and you’re all set to start exploring.</p>
      <p>Here’s what to do next:</p>
      <ul>
        <li>✅ Log in with your new account</li>
        <li>✅ Complete your profile setup</li>
        <li>✅ Start enjoying all the features we built for you</li>
      </ul>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" style="display:inline-block; padding:10px 20px; margin-top:10px; background:#4f46e5; color:#fff; text-decoration:none; border-radius:6px;">
        Log in to your account
      </a>
      <p>If you didn’t create this account, you can safely ignore this email.</p>
      <p>Thanks for joining us — we can’t wait to see what you’ll build with DreamDAO.</p>
      <p>Cheers,<br/>The DreamDAO Team</p>
    </div>
  `;

  return sendMail(email, "✅ Account Verified - Welcome to DreamDAO!", html);
}
