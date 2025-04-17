// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  // Log full error in development
  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid token or unauthorized access'
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      status: 'error',
      message: 'Access forbidden'
    });
  }

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      status: 'error',
      message: 'CORS: Request origin not allowed'
    });
  }

  // Default to 500 server error
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'An unexpected error occurred' 
    : err.message || 'An unexpected error occurred';

  return res.status(statusCode).json({
    status: 'error',
    message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

// Catch-all for unhandled routes
const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
}; 