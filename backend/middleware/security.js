import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10m
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: 429,
  message: {
    error: {
      code: 429,
      message: "Too many requests, please try again after 10 minutes."
    }
  },
  keyGenerator: (req, res) => {
    return req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  },
});

export const securityMiddleware = [
  helmet(),
  apiLimiter,
];