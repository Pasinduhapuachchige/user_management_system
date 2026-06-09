import Admin from '../models/admin.model.js';
import bcrypt from 'bcryptjs';

export const registerAdmin = async ({ email, password, epfNo, role = 'hr_officer' }) => {
    // 1. Check if the email is already in use by ANOTHER account (different EPF number)
    const emailConflict = await Admin.findOne({ email, epfNo: { $ne: epfNo } });
    if (emailConflict) {
        throw new Error('Admin with this email already exists');
    }

    // 2. Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Check if a credentials record already exists for this EPF number
    let admin = await Admin.findOne({ epfNo });

    if (admin) {
        // Elevate/update the existing credentials record
        admin.email = email;
        admin.password = hashedPassword;
        admin.role = role;
        admin.isActive = true; // Ensure the account is enabled
        await admin.save();
    } else {
        // Create a new credentials record
        admin = new Admin({
            email,
            password: hashedPassword,
            epfNo,
            role
        });
        await admin.save();
    }

    return admin;
};

export const updatePassword = async (email, password) => {
    try {
        const admin = await Admin.findOne({ email });
        if (!admin) throw new Error('Account not found (2.0)');

        const hashedPassword = await bcrypt.hash(password, 10);
        admin.password = hashedPassword;

        await admin.save();
        return { success: true };
    } catch (e) {
        return { success: false, message: e.message };
    }
};


export const getAdmins = async (query = {}) => {
    try {
        const admins = await Admin.find(query);
        return admins;
    } catch (error) {
        throw new Error('Error fetching admins: ' + error.message);
    }
};
