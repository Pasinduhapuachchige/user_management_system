import Admin from "../models/admin.model.js";
import bcrypt from 'bcryptjs';

export const validateUser = async (email = '', epf = '', password) => {
    try {
        let admin = null;

        if (email) {
            admin = await Admin.findOne({ email });
        } else if (epf) {
            admin = await Admin.findOne({ epfNo: Number(epf) });
        }

        if (!admin) {
            return null;
        }

        const isMatched = await bcrypt.compare(password, admin.password);
        if (!isMatched) {
            return null;
        }

        return {
            _id: admin._id,
            email: admin.email,
            epfNo: admin.epfNo,
            role: admin.role,
            passwordUpdatedAt: admin.passwordUpdatedAt,
            createdAt: admin.createdAt
        };

    } catch (e) {
        console.error("Validation Error:", e);
        return null;
    }
};

export const isPasswordExpired = (admin) => {
    if (!admin) return false;
    // Password reset every 3 months (90 days) applies to HR officers and admin roles
    const hrRoles = ['hr_officer', 'hr_manager', 'admin'];
    if (!hrRoles.includes(admin.role)) {
        return false;
    }
    const passwordDate = admin.passwordUpdatedAt || admin.createdAt;
    if (!passwordDate) return false;
    const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
    return (Date.now() - new Date(passwordDate).getTime()) > ninetyDaysInMs;
};

export const tougleAccountStatus = async (accId) => {
    try {
        const admin = await Admin.findById(accId);
        if (!admin) {
            throw new Error('Account not found');
        }
        if (admin.isActive) {
            admin.isActive = false;
        } else {
            admin.isActive = true;
        }

        await admin.save();

        return {
            success: true,
            data: accId
        }
    } catch (e) {
        throw new Error(e.message)
    }
}

export const deleteAccount = async (accId) => {
    try {
        const admin = await Admin.findByIdAndDelete(accId);
        return {
            success: true,
            data: accId
        }
    } catch (e) {
        throw new Error(e.message)
    }
}