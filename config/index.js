/**
 * Config loader that selects environment-specific configuration
 * and merges it with default settings
 */
const path = require('path');
const _ = require('lodash');

// Set default environment if not specified
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const env = process.env.NODE_ENV;

// Load default config
const defaultConfig = require('./default');

// Load environment-specific config
let envConfig = {};
try {
  envConfig = require(`./${env}`);
} catch (err) {
  console.warn(`No config found for environment "${env}", using defaults only`);
}

// Deep merge configs with environment config taking precedence
const config = _.merge({}, defaultConfig, envConfig);

// Add environment for easy reference
config.env = env;

// Helper to check if we're in production
config.isProduction = env === 'production';
config.isDevelopment = env === 'development';
config.isTest = env === 'test';

module.exports = config; 