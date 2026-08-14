import jwt from 'jsonwebtoken';
import { getAdmins } from '../services/register.service.js';
import { isPasswordExpired } from '../services/auth.service.js';

export const verifyAuth = async (req, res, next) => {
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized 1.0',
            message: 'Session expired'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const [admin] = await getAdmins({ _id: decoded.id });

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized 1.1',
                message: 'Invalid account'
            });
        }

        req.user = {
            _id: decoded.id,
            email: admin.email || decoded.email,
            epfNo: admin.epfNo,
            role: decoded.role
        };

        if (admin.isActive === false) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized 1.2',
                message: 'Account disabled'
            });
        }

        if (global.maintenanceModeActive && admin.role !== 'superadmin') {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized 1.4',
                message: 'System is currently undergoing scheduled maintenance. Access is suspended.'
            });
        }

        if (isPasswordExpired(admin) && !req.path.includes('/update-pwd')) {
            return res.status(403).json({
                success: false,
                error: 'PASSWORD_EXPIRED',
                requirePasswordReset: true,
                message: 'Your password has expired after 3 months. Please reset your password to continue.'
            });
        }

        next();
    } catch (err) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized 1.3',
            message: 'Session expired or invalid token'
        });
    }
};

export const verifySuperAdmin = async (req, res, next) => {
    verifyAuth(req, res, () => {
        if (req.user && req.user.role === 'superadmin') {
            next();
        } else {
            return res.status(403).json({
                success: false,
                error: 'Forbidden',
                message: 'Admin access only: Require Super Admin Role'
            });
        }
    });
};
