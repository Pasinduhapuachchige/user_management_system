import jwt from 'jsonwebtoken';
import { getAdmins } from '../services/register.service.js';

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

        req.user = {
            _id: decoded.id,
            email: decoded.email,
            role: decoded.role
        };

        const [admin] = await getAdmins({ email: decoded.email });

        if (!admin) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized 1.1',
                message: 'Invalid administration account'
            });
        }

        if (admin.isActive === false) {
            return res.status(401).json({
                success: false,
                error: 'Unauthorized 1.2',
                message: 'Account disabled'
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
