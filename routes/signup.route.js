//libs
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../config/db');

//routes
router.post('/signup', (req, res) => {
    const { firstName, lastName, email, password } = req.body;

    
})
