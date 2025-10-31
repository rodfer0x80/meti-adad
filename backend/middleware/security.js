import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// #TODO: Enable proxy pass for accurate rate limiting (from error log)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    message: {
        error: {
            code: 429,
            message: "Too many requests, please try again after 15 minutes."
        }
    },
    statusCode: 429,
});

export const securityMiddleware = [
    helmet(), 
    apiLimiter, 
];
