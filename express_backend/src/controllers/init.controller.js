import { registerAdmin } from "../services/register.service.js";

export const initSuperAdminController = async (req, res) => {
    try {
        const admin = await registerAdmin({
            email: "superadmin@system.com",
            password: "SuperAdmin@123",
            epfNo: 0,
            role: "superadmin"
        });

        res.status(201).json({
            message: 'Super Admin initialized successfully',
            success: true,
            admin: {
                id: admin._id,
                email: admin.email,
                role: admin.role
            },
        });
    } catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(400).json({ message: 'Super Admin already initialized' });
        }
        res.status(500).json({ message: error.message });
    }
};
