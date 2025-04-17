const rateLimit = require('express-rate-limit');
const config = require('../config');

// Create rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: config.security.rateLimiting.api.windowMs, // From config
  max: config.security.rateLimiting.api.max, // From config
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});

// More strict rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: config.security.rateLimiting.auth.windowMs, // From config
  max: config.security.rateLimiting.auth.max, // From config
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many login attempts, please try again later.'
  }
});

module.exports = {
  apiLimiter,
  authLimiter
}; 