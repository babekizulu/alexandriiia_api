/**
 * Production environment configuration
 */
module.exports = {
  cookie: {
    secure: true,
    sameSite: 'none'
  },
  cors: {
    // Strict origin settings for production
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [],
    credentials: true
  },
  logging: {
    level: 'error'
  },
  security: {
    // Stricter rate limits for production
    rateLimiting: {
      api: {
        max: 60
      },
      auth: {
        max: 5
      }
    }
  }
}; 