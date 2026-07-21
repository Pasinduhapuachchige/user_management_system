import AuditLog from '../models/auditLog.model.js';

/**
 * Log a system activity event to the database
 * @param {Object} params
 * @param {string} params.action - e.g. 'LOGIN', 'EMPLOYEE_CREATE', 'BACKUP_DOWNLOAD'
 * @param {Object} [params.req] - Express request object to extract IP & User
 * @param {Object} [params.performedBy] - Explicit user info if req is unavailable
 * @param {string} [params.targetResource] - Name or ID of affected resource
 * @param {Object} [params.details] - Additional contextual data
 * @param {'SUCCESS'|'FAILURE'|'WARNING'} [params.status] - Status of action
 */
export const logActivity = async ({
    action,
    req,
    performedBy,
    targetResource = '',
    details = {},
    status = 'SUCCESS'
}) => {
    try {
        let user = performedBy;

        if (!user && req?.user) {
            user = {
                userId: req.user._id,
                email: req.user.email,
                role: req.user.role
            };
        }

        const ipAddress = req ? (req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '') : '';

        await AuditLog.create({
            action,
            performedBy: user || { email: 'System/Public' },
            targetResource,
            details,
            ipAddress,
            status
        });
    } catch (err) {
        console.error('⚠️ Failed to write audit log:', err.message);
    }
};

/**
 * Fetch audit logs with pagination and filtering
 */
export const getAuditLogs = async (query = {}, options = {}) => {
    const limit = options.limit || 50;
    const page = options.page || 1;
    const skip = (page - 1) * limit;

    const logs = await AuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await AuditLog.countDocuments(query);

    return { logs, total, page, totalPages: Math.ceil(total / limit) };
};
