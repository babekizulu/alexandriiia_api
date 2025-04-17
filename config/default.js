/**
 * Default configuration values
 * These are used as fallbacks if environment-specific values aren't set
 */
module.exports = {
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development'
  },
  cookie: {
    secret: process.env.COOKIE_SECRET || 'default_cookie_secret',
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true
  },
  security: {
    csrfEnabled: true,
    rateLimiting: {
      api: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
      },
      auth: {
        windowMs: 60 * 60 * 1000, // 1 hour
        max: 5 // limit each IP to 5 login requests per hour
      }
    }
  },
  cors: {
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400 // Cache preflight request for 24 hours
  }
}; 