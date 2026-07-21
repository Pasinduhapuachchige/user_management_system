/**
 * Centralized Error Handling Middleware for Express
 * Prevents raw HTML 500 error pages and ensures consistent JSON responses.
 */
export const errorHandler = (err, req, res, next) => {
    console.error('❌ Centralized Error Handler:', err.stack || err.message || err);

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            message: errors.join(', ')
        });
    }

    // Mongoose Duplicate Key Error (E11000)
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        return res.status(409).json({
            success: false,
            error: 'Duplicate Entry',
            message: `A record with this ${field} already exists.`
        });
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized',
            message: 'Invalid or expired session token.'
        });
    }

    // Default 500 Internal Server Error
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.name || 'Internal Server Error',
        message: err.message || 'An unexpected error occurred on the server.'
    });
};
