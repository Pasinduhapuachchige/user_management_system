import { sendEmail } from '../services/email.service.js';

export const handleSupportContact = async (req, res) => {
    const { name, email, subject, category, message } = req.body;

    if (!name || !email || !subject || !category || !message) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    try {
        const supportEmail = process.env.EMAIL_USER;

        if (!supportEmail) {
            console.warn('EMAIL_USER is not configured in environment variables. Falling back to sender email.');
        }

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #1e293b; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; color: white;">
                    <h2 style="margin: 0; font-size: 20px; font-weight: 700;">SPC Welfare Help Desk</h2>
                    <p style="margin: 5px 0 0 0; font-size: 14px; opacity: 0.8;">New Technical Support Inquiry</p>
                </div>
                <div style="padding: 24px; background-color: white; border-radius: 0 0 8px 8px; border: 1px solid #f1f5f9; border-top: none;">
                    <div style="margin-bottom: 20px;">
                        <span style="background-color: #e2e8f0; padding: 4px 10px; border-radius: 6px; font-weight: bold; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.05em;">
                            Category: ${category}
                        </span>
                    </div>
                    <h3 style="margin: 0 0 16px 0; font-size: 18px; color: #0f172a;">${subject}</h3>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #64748b;"><strong>Submitted By:</strong> ${name}</p>
                    <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b;"><strong>Contact Email:</strong> <a href="mailto:${email}" style="color: #4f46e5; text-decoration: none;">${email}</a></p>
                    <div style="background-color: #f8fafc; padding: 18px; border-radius: 8px; border-left: 4px solid #4f46e5; white-space: pre-wrap; font-style: italic; color: #334155; line-height: 1.6;">
"${message}"
                    </div>
                </div>
                <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #94a3b8;">
                    This inquiry was submitted via the Support & Help Center inside the SPC Welfare Management System.
                </div>
            </div>
        `;

        await sendEmail({
            to: supportEmail || email,
            subject: `[Support Inquiry] ${category}: ${subject}`,
            text: `SPC Welfare Support - Subject: ${subject}\n\nCategory: ${category}\nFrom: ${name} (${email})\n\nMessage:\n${message}`,
            html: emailHtml
        });

        res.status(200).json({ success: true, message: 'Message sent successfully. The technical team will contact you soon.' });
    } catch (error) {
        console.error('Support Contact Controller Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send support email. Please try again later.' });
    }
};
