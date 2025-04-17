/**
 * Development environment configuration
 */
module.exports = {
  cookie: {
    secure: false,
    sameSite: 'lax'
  },
  cors: {
    // More permissive origin settings for development
    origin: true, // Allow all origins in development
    credentials: true
  },
  logging: {
    level: 'debug'
  }
}; 