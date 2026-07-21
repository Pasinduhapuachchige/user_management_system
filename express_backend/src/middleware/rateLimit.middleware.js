// Lightweight in-memory rate limiting middleware
const requestCounts = new Map();

/**
 * Creates a rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 15 mins)
 * @param {number} options.max - Max requests per windowMs (default: 15)
 * @param {string} options.message - Error message when rate limit exceeded
 */
export const createRateLimiter = (options = {}) => {
    const windowMs = options.windowMs || 15 * 60 * 1000; // 15 minutes
    const max = options.max || 15;
    const message = options.message || 'Too many requests, please try again later.';

    // Clean up expired entries periodically
    setInterval(() => {
        const now = Date.now();
        for (const [key, record] of requestCounts.entries()) {
            if (now > record.resetTime) {
                requestCounts.delete(key);
            }
        }
    }, 5 * 60 * 1000);

    return (req, res, next) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
        const key = `${req.path}_${ip}`;
        const now = Date.now();

        let record = requestCounts.get(key);

        if (!record || now > record.resetTime) {
            record = {
                count: 1,
                resetTime: now + windowMs
            };
            requestCounts.set(key, record);
            return next();
        }

        record.count++;

        if (record.count > max) {
            const retryAfterSecs = Math.ceil((record.resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfterSecs);
            return res.status(429).json({
                success: false,
                error: 'Too Many Requests',
                message: `${message} Try again in ${retryAfterSecs} seconds.`
            });
        }

        next();
    };
};
