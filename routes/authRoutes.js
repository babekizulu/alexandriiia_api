const express = require('express');
const router = express.Router();
const { signup, signin, verifyToken, updateSubscription, signout } = require('../controllers/authcontroller');
const { authenticateToken } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/verify-token', authenticateToken, verifyToken);
router.post('/update-subscription', authenticateToken, updateSubscription);
router.post('/signout', signout);

module.exports = router;
