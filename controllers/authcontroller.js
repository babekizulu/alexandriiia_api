const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db/db'); // assuming you use pg
require('dotenv').config();

// Cookie configuration for both signin and signup
const getCookieConfig = () => {
  // Base cookie config
  const cookieConfig = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  // Add sameSite and domain settings for production
  if (process.env.NODE_ENV === 'production') {
    cookieConfig.sameSite = 'none'; // For cross-site cookies
    
    // If you've defined a specific cookie domain in env vars, use it
    if (process.env.COOKIE_DOMAIN) {
      cookieConfig.domain = process.env.COOKIE_DOMAIN;
    }
  } else {
    cookieConfig.sameSite = 'lax'; // More permissive for development
  }

  return cookieConfig;
};

const signup = async (req, res) => {
  const { first_name, last_name, username, email, password, subscription_tier } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Set default subscription data
    const tier = subscription_tier || 'free';
    let subscription_expires = null;
    
    // If not free tier, set expiration to 30 days from now
    if (tier !== 'free') {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);
      subscription_expires = expiryDate;
    }
    
    const result = await pool.query(
      'INSERT INTO users (first_name, last_name, username, email, password, subscription_tier, subscription_expires) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [first_name, last_name, username, email, hashedPassword, tier, subscription_expires]
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });

    // Set token in HTTP-only cookie with improved config
    res.cookie('authToken', token, getCookieConfig());

    res.status(201).json({ 
      user: { 
        id: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email, 
        username: user.username,
        subscription_tier: user.subscription_tier,
        subscription_expires: user.subscription_expires
      } 
    });
  } catch (err) {
    // Log the detailed error for server-side debugging
    console.error('Signup Error:', err); 

    // Determine a user-friendly message
    let userMessage = 'Signup failed due to an unexpected error.';
    if (err.code === '23505') { // PostgreSQL unique violation error code
        if (err.constraint === 'users_email_key') {
            userMessage = 'Email address is already registered.';
        } else if (err.constraint === 'users_username_key') {
            userMessage = 'Username is already taken.';
        } else {
            userMessage = 'A user with this information already exists.'; // Generic unique constraint message
        }
    } else if (err.message) {
        // Use generic message but include simplified error if available and not unique violation
        // Avoid exposing sensitive details
        userMessage = `Signup failed: ${err.message.split('\n')[0]}`; // Send only the first line of the error
    }

    // Send 400 status with a 'message' field for the client
    res.status(400).json({ message: userMessage, details_dev: err }); // Keep details for dev if needed, but client uses 'message'
  }
};

const signin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRY });

    // Set token in HTTP-only cookie with improved config
    res.cookie('authToken', token, getCookieConfig());

    res.status(200).json({ 
      user: { 
        id: user.id, 
        first_name: user.first_name, 
        last_name: user.last_name, 
        email: user.email,
        username: user.username,
        subscription_tier: user.subscription_tier,
        subscription_expires: user.subscription_expires
      } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Sign in failed', details: err });
  }
};

const verifyToken = async (req, res) => {
  try {
    // The authenticateToken middleware has already verified the token
    // and added the user id to req.user
    const userId = req.user.id;
    
    // Get user data from database
    const result = await pool.query(
      'SELECT id, first_name, last_name, email, username, subscription_tier, subscription_expires FROM users WHERE id = $1', 
      [userId]
    );
    const user = result.rows[0];
    
    if (!user) {
      return res.status(404).json({ valid: false, error: 'User not found' });
    }
    
    return res.status(200).json({
      valid: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        subscription_tier: user.subscription_tier,
        subscription_expires: user.subscription_expires
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
};

// New endpoint to update user subscription
const updateSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscription_tier, subscription_duration } = req.body;
    
    // Calculate expiration date
    let subscription_expires = null;
    if (subscription_tier !== 'free') {
      const expiryDate = new Date();
      // Default to 30 days if not specified
      const days = subscription_duration || 30;
      expiryDate.setDate(expiryDate.getDate() + parseInt(days));
      subscription_expires = expiryDate;
    }
    
    // Update user subscription in database
    const result = await pool.query(
      'UPDATE users SET subscription_tier = $1, subscription_expires = $2 WHERE id = $3 RETURNING id, first_name, last_name, email, username, subscription_tier, subscription_expires',
      [subscription_tier, subscription_expires, userId]
    );
    
    const user = result.rows[0];
    
    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        username: user.username,
        subscription_tier: user.subscription_tier,
        subscription_expires: user.subscription_expires
      }
    });
  } catch (error) {
    console.error('Subscription update error:', error);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Add a signout function to clear the cookie
const signout = async (req, res) => {
  // Use the same cookie config but with maxAge: 0 to clear it
  const cookieConfig = getCookieConfig();
  cookieConfig.maxAge = 0;
  
  res.clearCookie('authToken', cookieConfig);
  
  res.status(200).json({ message: 'Signed out successfully' });
};

module.exports = { signup, signin, verifyToken, updateSubscription, signout };
