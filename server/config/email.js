import nodemailer from 'nodemailer';

let transporter = null;

export const getMailerTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, EMAIL_USER, EMAIL_PASS } = process.env;

  if (SMTP_HOST && EMAIL_USER && EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
      }
    });
    console.log(`[Email] Production SMTP Transporter initialized (${SMTP_HOST})`);
  } else {
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email] Ethereal test mailer account active: ${testAccount.user}`);
    } catch (err) {
      transporter = nodemailer.createTransport({ jsonTransport: true });
    }
  }

  return transporter;
};

/**
 * Generate branded HTML email template for CXO Connect
 */
export const buildOtpEmailTemplate = (otp, userName = 'Executive Leader', expiryMinutes = 10) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your CXO Connect Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #060913; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #060913; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #0e1526; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 32px; text-align: center; background: linear-gradient(180deg, #1e1b4b 0%, #0e1526 100%); border-bottom: 1px solid rgba(255, 255, 255, 0.08);">
              <div style="display: inline-block; padding: 6px 14px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; margin-bottom: 12px;">
                <span style="color: #c7d2fe; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">PREMIER C-SUITE COMMUNITY</span>
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
                CXO Connect
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <p style="margin: 0 0 16px 0; font-size: 16px; color: #e2e8f0;">
                Hello <strong>${userName}</strong>,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 14px; color: #94a3b8; line-height: 1.6;">
                Use the single-use verification code below to securely authenticate your executive session on <strong>CXO Connect</strong>:
              </p>

              <!-- OTP Box -->
              <div style="background: rgba(99, 102, 241, 0.08); border: 2px dashed #6366f1; border-radius: 12px; padding: 22px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #818cf8; margin-bottom: 8px;">
                  Your 6-Digit Verification Code
                </div>
                <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #ffffff;">
                  ${otp}
                </div>
                <div style="margin-top: 10px; font-size: 12px; color: #f87171; font-weight: 500;">
                  ⏱ Expires in ${expiryMinutes} minutes
                </div>
              </div>

              <div style="background-color: rgba(255, 255, 255, 0.03); border-left: 3px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-top: 24px;">
                <p style="margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.5;">
                  <strong>Confidentiality Notice:</strong> Do not share this authentication code with anyone. If you did not initiate this login request, no action is required.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #060913; border-top: 1px solid rgba(255, 255, 255, 0.08); text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b;">
                &copy; ${new Date().getFullYear()} CXO Connect. All rights reserved.
              </p>
              <p style="margin: 0; font-size: 11px; color: #475569;">
                The Premier Network for C-Suite Executives, VPs, and Founders.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * Dispatch OTP verification email
 */
export const sendOtpEmail = async (toEmail, otp, userName = 'Executive Leader') => {
  try {
    const mailer = await getMailerTransporter();
    const fromAddress = process.env.FROM_EMAIL || '"CXO Connect" <notifications@cxoconnect.com>';
    const html = buildOtpEmailTemplate(otp, userName, 10);

    const info = await mailer.sendMail({
      from: fromAddress,
      to: toEmail,
      subject: `Your CXO Connect Login Code: ${otp}`,
      html
    });

    console.log(`[Email] OTP sent to ${toEmail}. MessageId: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log(`[Email] 📧 Preview URL: ${previewUrl}`);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV OTP LOG] One-Time Password for ${toEmail}: [ ${otp} ]`);
    }

    return { success: true, messageId: info.messageId, previewUrl };
  } catch (error) {
    console.error(`[Email] Dispatch failed for ${toEmail}:`, error.message);
    console.log(`[DEV OTP FALLBACK] OTP for ${toEmail}: [ ${otp} ]`);
    return { success: false, error: error.message };
  }
};

/**
 * Dispatch generic notification email
 */
export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailer = await getMailerTransporter();
    const fromAddress = process.env.FROM_EMAIL || '"CXO Connect" <notifications@cxoconnect.com>';
    const info = await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      html
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email] Dispatch failed for ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};
