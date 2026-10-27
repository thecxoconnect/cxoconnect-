import nodemailer from 'nodemailer';
import {
  buildOtpEmailTemplate,
  buildApplicationReceivedTemplate,
  buildAccountActivationTemplate,
  buildPasswordResetTemplate
} from '../utils/emailTemplates.js';
import { OTP_CONFIG } from './constants.js';

let transporter = null;

export const getMailerTransporter = async () => {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      }
    });
    console.log(`[Mailer] Initialized SMTP Transporter (${SMTP_HOST}:${SMTP_PORT || 587})`);
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
      console.log(`[Mailer] Using Ethereal test mailer account: ${testAccount.user}`);
    } catch (err) {
      console.warn(`[Mailer] Ethereal creation failed, using mock stream transporter. (${err.message})`);
      transporter = nodemailer.createTransport({
        jsonTransport: true
      });
    }
  }

  return transporter;
};

const dispatchMail = async (to, subject, html) => {
  try {
    const mailer = await getMailerTransporter();
    const fromAddress = process.env.FROM_EMAIL || '"The CXO Network / HRSG" <membership@thecxonetwork.org>';

    const info = await mailer.sendMail({
      from: fromAddress,
      to,
      subject,
      html
    });

    console.log(`[Mailer] Dispatched "${subject}" to ${to}. MessageId: ${info.messageId}`);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Mailer] 📧 Preview URL: ${previewUrl}`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch (err) {
    console.error(`[Mailer] Failed sending email to ${to}:`, err.message);
    return { success: false, error: err.message };
  }
};

export const sendOtpEmail = async (toEmail, otp, userName = 'Member') => {
  const html = buildOtpEmailTemplate(otp, userName, OTP_CONFIG.EXPIRY_MINUTES);
  console.log(`[DEV OTP HELPER] One-Time Password for ${toEmail} is: [ ${otp} ]`);
  return dispatchMail(toEmail, `Your Verification Code: ${otp} - The CXO Network`, html);
};

export const sendApplicationReceivedEmail = async (toEmail, name, company) => {
  const html = buildApplicationReceivedTemplate(name, company);
  return dispatchMail(toEmail, 'Membership Application Received - The CXO Network', html);
};

export const sendActivationEmail = async (toEmail, name, activationUrl) => {
  const html = buildAccountActivationTemplate(name, activationUrl);
  console.log(`[DEV ACTIVATION HELPER] Activation URL for ${toEmail}: ${activationUrl}`);
  return dispatchMail(toEmail, 'Activate Your Membership - The CXO Network', html);
};

export const sendPasswordResetEmail = async (toEmail, name, resetUrl) => {
  const html = buildPasswordResetTemplate(name, resetUrl);
  console.log(`[DEV RESET HELPER] Password Reset URL for ${toEmail}: ${resetUrl}`);
  return dispatchMail(toEmail, 'Reset Your Password - The CXO Network', html);
};
