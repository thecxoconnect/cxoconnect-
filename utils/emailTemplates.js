import { CXO_NAVBAR_ITEMS } from '../config/constants.js';

const getEmailHeader = (title = 'The CXO Network') => `
  <tr>
    <td style="padding: 32px 32px 20px 32px; text-align: center; border-bottom: 1px solid #1f2937; background: linear-gradient(180deg, #1e1b4b 0%, #111827 100%);">
      <div style="display: inline-block; padding: 6px 14px; background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 9999px; margin-bottom: 12px;">
        <span style="color: #a5b4fc; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;">THE CXO NETWORK</span>
      </div>
      <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">
        ${title}
      </h1>
    </td>
  </tr>
`;

const getEmailFooter = () => `
  <tr>
    <td style="padding: 24px 32px; background-color: #0f172a; border-top: 1px solid #1f2937; text-align: center;">
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #9ca3af;">
        &copy; ${new Date().getFullYear()} The CXO Network. An executive initiative powered by HRSG.
      </p>
      <p style="margin: 0; font-size: 12px; color: #6b7280;">
        Annual Leadership Conclave &bull; 30 October 2026 &bull; The St. Regis
      </p>
    </td>
  </tr>
`;

/**
 * 1. OTP Verification Email Template
 */
export const buildOtpEmailTemplate = (otp, userName = 'Member', expiryMinutes = 10) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Verification Code - The CXO Network</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden;">
          ${getEmailHeader('Executive Verification')}
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 15px; color: #e5e7eb; margin: 0 0 16px 0;">Hello <strong>${userName}</strong>,</p>
              <p style="font-size: 14px; color: #9ca3af; margin: 0 0 24px 0;">
                Use the one-time code below to authenticate your session with The CXO Network portal.
              </p>
              <div style="background: rgba(99, 102, 241, 0.1); border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #818cf8; margin-bottom: 6px;">One-Time Verification Code</div>
                <div style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 6px; color: #ffffff;">${otp}</div>
                <div style="font-size: 12px; color: #f87171; margin-top: 8px;">Expires in ${expiryMinutes} minutes</div>
              </div>
              <p style="font-size: 12px; color: #6b7280; margin: 0;">If you did not request this code, please ignore this email.</p>
            </td>
          </tr>
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * 2. Application Received Acknowledgment Template
 */
export const buildApplicationReceivedTemplate = (name, company) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Application Received - The CXO Network</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden;">
          ${getEmailHeader('Membership Application Received')}
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 16px 0;">Dear <strong>${name}</strong>,</p>
              <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 20px 0;">
                Thank you for your interest in joining <strong>The CXO Network</strong> on behalf of <strong>${company || 'your organization'}</strong>.
              </p>
              <div style="background: rgba(16, 185, 129, 0.1); border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0; font-size: 13px; color: #d1fae5; line-height: 1.5;">
                  <strong>Application Status: Under Review</strong><br>
                  Our executive membership committee evaluates leadership credentials to preserve a peer-level forum. Approval and account activation details will be communicated via email prior to the 30 October Conclave.
                </p>
              </div>
              <p style="font-size: 13px; color: #9ca3af; margin: 0 0 8px 0;">
                <strong>Event Details:</strong> Annual Leadership Conclave &bull; 30 October 2026 &bull; The St. Regis
              </p>
            </td>
          </tr>
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * 3. Account Activation Invitation Template
 */
export const buildAccountActivationTemplate = (name, activationUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Activate Your Membership - The CXO Network</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden;">
          ${getEmailHeader('Membership Approved')}
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 16px 0;">Dear <strong>${name}</strong>,</p>
              <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
                We are delighted to welcome you to <strong>The CXO Network</strong>. Your membership application has been approved.
              </p>
              <p style="font-size: 14px; color: #e5e7eb; margin: 0 0 20px 0;">
                Please set your secure password to complete your account activation and access your Member Dashboard and 30 October event details:
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${activationUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 700; border-radius: 8px; font-size: 14px; display: inline-block;">
                  Activate Your Account &rarr;
                </a>
              </div>
              <p style="font-size: 12px; color: #6b7280; word-break: break-all; margin: 20px 0 0 0;">
                If the button above does not work, copy and paste this link into your browser:<br>
                <a href="${activationUrl}" style="color: #818cf8;">${activationUrl}</a>
              </p>
            </td>
          </tr>
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};

/**
 * 4. Password Reset Template
 */
export const buildPasswordResetTemplate = (name, resetUrl) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password - The CXO Network</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 600px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden;">
          ${getEmailHeader('Password Recovery')}
          <tr>
            <td style="padding: 32px;">
              <p style="font-size: 16px; color: #e5e7eb; margin: 0 0 16px 0;">Hello <strong>${name}</strong>,</p>
              <p style="font-size: 14px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px 0;">
                We received a request to reset your password for The CXO Network portal.
              </p>
              <div style="text-align: center; margin: 28px 0;">
                <a href="${resetUrl}" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: 700; border-radius: 8px; font-size: 14px; display: inline-block;">
                  Reset Password &rarr;
                </a>
              </div>
              <p style="font-size: 12px; color: #6b7280; margin: 20px 0 0 0;">
                This link will expire in 1 hour. If you did not request a password reset, no action is needed.
              </p>
            </td>
          </tr>
          ${getEmailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
};
