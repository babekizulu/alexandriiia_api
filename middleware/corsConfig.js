const cors = require('cors');
const config = require('../config');

// Get CORS configuration from our config system
const configureCors = () => {
  // Check if CORS config is in our config system
  if (config.cors) {
    return cors(config.cors);
  }
  
  // Legacy config as fallback
  // Whitelist of trusted domains
  const whitelist = [
    'http://localhost:5000',
    'http://localhost:3000', // Common frontend dev port
    'https://alexandriiia.com',
    'https://alexandriiia-api-1.onrender.com', // Backend domain (for same-origin requests)
    'https://alexandriiia.netlify.app' // Assuming frontend might be on Netlify based on netlify.toml
  ];

  // CORS options configuration
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl requests)
      if (!origin || whitelist.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('Origin blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token'],
    credentials: true,
    maxAge: 86400 // Cache preflight request for 24 hours
  };

  return cors(corsOptions);
};

// Create middleware
const corsMiddleware = configureCors();

module.exports = corsMiddleware; 