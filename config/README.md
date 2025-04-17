# Environment-Specific Configuration System

This directory contains the configuration system for the application. The system loads different settings based on the current environment (development, production, etc.).

## How It Works

1. The main configuration loader is in `index.js`
2. Default configuration values are in `default.js`
3. Environment-specific overrides are in files named after the environment (e.g., `development.js`, `production.js`)
4. Configuration values are merged with environment-specific values taking precedence over defaults

## Usage

Import the configuration system in your module:

```javascript
const config = require('./config');
```

Then access configuration values:

```javascript
// Access server port
const port = config.server.port;

// Check environment
if (config.isProduction) {
  // Do production-specific setup
}
```

## Adding New Configuration

1. Add default values to `default.js`
2. Add environment-specific overrides to the appropriate environment file
3. Use the configuration in your code by accessing the values from the config object

## Environment Variables

The configuration system still respects environment variables set in `.env` files or the system environment. These are loaded before the configuration system is initialized. 