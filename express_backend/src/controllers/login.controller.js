import jwt from 'jsonwebtoken';
import { validateUser, isPasswordExpired } from '../services/auth.service.js';
import { logActivity } from '../services/auditLog.service.js';

export const loginController = async (req, res) => {
    const { emailOrEpf, password, rememberMe } = req.body;

    if (!emailOrEpf || !password) {
        return res.status(400).json({ message: 'Email/EPF and password are required' });
    }

    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrEpf);

    try {
        const admin = isEmail
            ? await validateUser(emailOrEpf, '', password)
            : await validateUser('', emailOrEpf, password);

        if (!admin) {
            logActivity({ action: 'LOGIN_FAILED', req, performedBy: { email: emailOrEpf }, status: 'FAILURE' });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (admin.isActive == false) {
            logActivity({ action: 'LOGIN_DISABLED_ACCOUNT', req, performedBy: { email: admin.email }, status: 'WARNING' });
            return res.status(401).json({ message: 'Account disabled.' })
        }

        if (global.maintenanceModeActive && admin.role !== 'superadmin') {
            logActivity({ action: 'LOGIN_MAINTENANCE_BLOCKED', req, performedBy: { email: admin.email }, status: 'WARNING' });
            return res.status(403).json({ message: 'Login is suspended as the system is in Maintenance Mode.' })
        }

        if (isPasswordExpired(admin)) {
            logActivity({ action: 'LOGIN_PASSWORD_EXPIRED', req, performedBy: { email: admin.email }, status: 'WARNING' });
            return res.status(403).json({
                success: false,
                requirePasswordReset: true,
                message: 'Your password has expired after 3 months. Please reset your password to log in.'
            });
        }

        // Set expiry based on rememberMe
        const expiresIn = rememberMe ? '7d' : '1d';
        const maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // ms

        const token = jwt.sign(
            { id: admin._id, email: admin.email, role: admin.role },
            process.env.JWT_SECRET,
            { expiresIn }
        );

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge,
        });

        logActivity({
            action: 'LOGIN_SUCCESS',
            req,
            performedBy: { userId: admin._id, email: admin.email, role: admin.role },
            status: 'SUCCESS'
        });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            admin
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
};
