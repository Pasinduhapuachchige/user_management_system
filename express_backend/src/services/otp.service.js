import Otp from "../models/otp.model.js";
import { getAdmins } from "./register.service.js";
import { sendEmail } from "./email.service.js";
import { getEmployeesByQuery } from "./employee.service.js";
import bcrypt from 'bcryptjs';
const SALT_ROUNDS = 10;

export const generateOtp = async (email) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000);

        const admins = await getAdmins({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });
        if (!admins || (Array.isArray(admins) && admins.length === 0)) {
            throw new Error('Admin account not found');
        }

        const adminAccount = Array.isArray(admins) ? admins[0] : admins;
        if (!adminAccount.isActive) {
            throw new Error('Admin account disabled');
        }

        let employeeName = adminAccount.email.split('@')[0];
        try {
            const employee = await getEmployeesByQuery({ epfNumber: String(adminAccount.epfNo) });
            if (employee && Array.isArray(employee) && employee.length > 0) {
                employeeName = employee[0].name;
            }
        } catch (err) {
            console.error('Failed to retrieve employee name for OTP:', err.message);
        }

        // ✅ Delete all previous OTPs
        await Otp.deleteMany({ user: adminAccount._id });

        // ✅ Hash the OTP before saving
        const hashedOtp = await bcrypt.hash(String(otp), SALT_ROUNDS);

        const newOtp = new Otp({
            user: adminAccount._id,
            otp: hashedOtp,
        });

        await newOtp.save();

        return { otp, name: employeeName };
    } catch (e) {
        console.error('Error generating OTP:', e);
        throw new Error(e.message || 'Failed to generate OTP');
    }
};

export const sendOtp = async (name, email, password) => {
    try {
        const appUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        const { otp, name: adminName } = await generateOtp(email);

        const subject = '🔐 OTP for Admin Verification - SPC HR Management System';
        const text = `Hi ${adminName},\n\nYour OTP is: ${otp}\nThis OTP will expire in 1 hour.\n\nLogin Email: ${email}\nPassword: ${password}\n\nVisit: ${appUrl}`;

        const html = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 10px; background-color: #f5f7fa;">
    <div style="max-width: 100%; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px 20px; text-align: center; color: white;">
            <div style="width: 60px; height: 60px; background: white; border-radius: 12px; margin: 0 auto 15px; line-height: 60px; text-align: center;">
                <img src="${appUrl}/spc-logo.png" alt="SPC" style="max-width: 80%; max-height: 80%; vertical-align: middle;" />
            </div>
            <h1 style="margin: 0; font-size: 22px; font-weight: 700;">SPC HR Dashboard</h1>
            <p style="margin: 5px 0 0; font-size: 14px; opacity: 0.9;">SPC HR Management System</p>
        </div>

        <div style="padding: 25px 20px;">
            <div style="text-align: center; margin-bottom: 25px;">
                <div style="font-size: 30px; margin-bottom: 10px;">🔐</div>
                <h2 style="color: #2d3748; font-size: 20px; margin: 0 0 8px; font-weight: 600;">Hi ${adminName}, here's your OTP</h2>
                <p style="color: #718096; font-size: 15px; margin: 0;">This OTP is valid for 5 minutes only.</p>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center;">
                <div style="font-size: 28px; font-weight: 700; color: #2b6cb0; letter-spacing: 4px;">${otp}</div>
            </div>

            <div style="text-align: center; margin: 25px 0;">
                <a href="${appUrl}" style="display: block; background: linear-gradient(135deg, #4299e1, #667eea); color: white; text-decoration: none; padding: 16px 20px; border-radius: 8px; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 3px 10px rgba(66, 153, 225, 0.3);">
                    Access Dashboard →
                </a>
            </div>

            <div style="background: #fefcbf; border: 1px solid #faf089; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #744210; font-size: 13px; line-height: 1.5;">
                    <strong>⚠️ Security Tip:</strong> Do not share your OTP with anyone. It will automatically expire after 1 hour.
                </p>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #a0aec0; font-size: 12px; margin: 0; line-height: 1.4;">
                    Need help? Contact support<br>
                    © SPC HR Management System
                </p>
            </div>
        </div>
    </div>
</div>
`;

        const emailResponse = await sendEmail({ to: email, subject, text, html });

        return { success: true, otp, emailResponse };
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw new Error('Failed to send OTP');
    }
};

export const validateOtp = async (email, otp) => {
    try {
        const admins = await getAdmins({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });
        const admin = Array.isArray(admins) ? admins[0] : admins;

        if (!admin) throw new Error('Account not found');

        const otpDb = await Otp.findOne({ user: admin._id, status: false });
        if (!otpDb) throw new Error('OTP expired or invalid');

        // ✅ Check if OTP has expired
        const now = new Date();
        const otpCreatedAt = new Date(otpDb.createdAt);
        const diffInMinutes = (now - otpCreatedAt) / (1000 * 60);

        if (diffInMinutes > 5) {
            otpDb.status = false;
            await otpDb.save();
            throw new Error('OTP has expired (past 5 minutes)');
        }

        // ✅ Compare provided OTP with hashed one
        const isMatch = await bcrypt.compare(String(otp), otpDb.otp);
        if (!isMatch) throw new Error('OTP incorrect');

        // ✅ Mark OTP as used
        otpDb.status = false;
        otpDb.validatedAt = new Date();
        await otpDb.save();

        return true;
    } catch (e) {
        return e.message;
    }
};

export const isOtpVerified = async (email) => {
    try {
        const admins = await getAdmins({ email: { $regex: new RegExp(`^${email.trim()}$`, 'i') } });
        const admin = Array.isArray(admins) ? admins[0] : admins;
        if (!admin) return false;

        const usedOtp = await Otp.findOne({
            user: admin._id,
            status: false,
            validatedAt: { $ne: null }
        }).sort({ validatedAt: -1 });

        if (!usedOtp) return false;

        const now = new Date();
        const validatedAt = new Date(usedOtp.validatedAt);
        const diffInMinutes = (now - validatedAt) / (1000 * 60);

        return diffInMinutes <= 5;
    } catch (e) {
        console.error('OTP verification check failed:', e);
        return false;
    }
};
