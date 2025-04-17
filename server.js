const express = require('express');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
const morgan = require('morgan');

// Load configuration
const config = require('./config');

// Import routes
const analysisRoute = require('./routes/analysis');
const weaveRoute = require('./routes/weave');
const verifyEvidenceRoute = require('./routes/verifyEvidence');
const curateRoute = require('./routes/curate');
const visionRoute = require('./routes/vision');
const reverseGeocodeRoute = require('./routes/reverseGeocode');
const locationHistoryRoute = require('./routes/locationHistory');
const relationsRoute = require('./routes/relations');
const figureSummaryRoute = require('./routes/figureSummary');
const figureLinkRoute = require('./routes/figureLink');
const authRoutes = require('./routes/authRoutes');

// Import custom middleware
const corsMiddleware = require('./middleware/corsConfig');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = config.server.port;

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Set NODE_ENV
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

// Cookie configuration for CSRF
const getCsrfCookieConfig = () => {
  // Base cookie config from configuration
  const cookieConfig = {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    path: '/',
    maxAge: config.cookie.maxAge
  };

  // Add sameSite and domain settings
  cookieConfig.sameSite = config.cookie.sameSite;
  
  // If you've defined a specific cookie domain in config, use it
  if (config.cookie.domain) {
    cookieConfig.domain = config.cookie.domain;
  }

  return cookieConfig;
};

// Security middleware
app.use(helmet()); // Add security headers
app.use(corsMiddleware); // Configure CORS with whitelist
app.use(express.json({ limit: '1mb' })); // Limit JSON payload size
app.use(express.urlencoded({ extended: true, limit: '1mb' })); // Limit URL-encoded payload size
app.use(cookieParser(config.cookie.secret)); // Parse cookies

// CSRF protection (only if enabled in config)
let csrfProtection = (req, res, next) => next(); // Default no-op middleware
if (config.security.csrfEnabled) {
  csrfProtection = csrf({ 
    cookie: getCsrfCookieConfig()
  });

  // CSRF token endpoint
  app.get('/api/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
  });

  // Apply CSRF protection to mutating routes
  app.use('/api/auth/signin', csrfProtection);
  app.use('/api/auth/signup', csrfProtection);
  // Add CSRF protection to any other routes that modify data
}

// Apply rate limiters
app.use('/api/', apiLimiter); // General API rate limiting
app.use('/api/auth', authLimiter); // Stricter rate limiting for auth routes

// Routes
app.use('/api/analyze', analysisRoute);
app.use('/api/weave', weaveRoute);
app.use('/api/verify-evidence', verifyEvidenceRoute);
app.use('/api/curate', curateRoute);
app.use('/api/vision', visionRoute);
app.use('/api/reverse-geocode', reverseGeocodeRoute);
app.use('/api/location-history', locationHistoryRoute);
app.use('/api/relations', relationsRoute);
app.use('/api/figure-summary', figureSummaryRoute);
app.use('/api/figure-link', figureLinkRoute);
app.use('/api/auth', authRoutes);

// Error handling middleware (must be after routes)
app.use(notFoundHandler); // 404 handler
app.use(errorHandler); // Global error handler

// Start server
app.listen(PORT, () => {
  console.log(`Server running in ${config.env} mode on port ${PORT}`);
});