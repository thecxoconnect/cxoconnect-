import { sendEmail } from '../config/email.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required.'
      });
    }

    // Try sending notification email if configured
    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #0f172a; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">New Executive Inquiry - CXO Connect</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Company:</strong> ${company || 'Not provided'}</p>
          <p><strong>Subject:</strong> ${subject || 'General Inquiry'}</p>
          <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin-top: 15px;">
            <strong>Message:</strong><br/>
            ${message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `;

      await sendEmail({
        to: process.env.EMAIL_USER || 'admin@cxoconnect.com',
        subject: `[CXO Connect Inquiry] ${subject || 'Inquiry from ' + name}`,
        html: emailHtml
      });
    } catch (mailErr) {
      console.warn('[Contact Email Notice] Nodemailer failed or unconfigured, proceeding with DB response:', mailErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Thank you for reaching out to CXO Connect. Our executive relationship team will respond promptly.'
    });
  } catch (error) {
    console.error('[submitContact Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit executive inquiry.',
      error: error.message
    });
  }
};
