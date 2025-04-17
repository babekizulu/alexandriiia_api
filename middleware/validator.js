const Joi = require('joi');

// Create validation middleware generator
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        status: 'error',
        message: error.details[0].message.replace(/['"]/g, '')
      });
    }
    
    next();
  };
};

// Common validation schemas
const schemas = {
  // Auth schemas
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  register: Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  
  // Example schema for API endpoints
  analyze: Joi.object({
    text: Joi.string().required(),
    options: Joi.object({
      depth: Joi.number().min(1).max(5),
      format: Joi.string().valid('json', 'text')
    }).optional()
  })
  
  // Add more schemas as needed for your specific API endpoints
};

module.exports = {
  validate,
  schemas
}; 