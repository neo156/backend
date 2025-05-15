const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
require('dotenv').config();

const User = require('../models/User');

// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post(
  '/',
  [
    check('username', 'Please add username').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: errors.array() 
      });
    }

    const { username, email, password } = req.body;

    try {
      // Check if user already exists with the same email or username
      let existingUser = await User.findOne({ 
        $or: [
          { email },
          { username }
        ]
      });

      if (existingUser) {
        if (existingUser.email === email) {
          return res.status(400).json({ 
            success: false, 
            message: 'Email already in use' 
          });
        } else {
          return res.status(400).json({ 
            success: false, 
            message: 'Username already taken' 
          });
        }
      }

      // Create the new user
      const user = new User({
        name: username, // Use username as name for backward compatibility
        username,
        email,
        password
      });

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Generate JWT token
      const payload = {
        user: {
          id: user.id,
          username: user.username
        }
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'quiz-flip-secret-key',
        {
          expiresIn: '30d'
        },
        (err, token) => {
          if (err) throw err;
          res.json({ 
            success: true, 
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email
            }
          });
        }
      );
    } catch (err) {
      console.error('Registration error:', err.message);
      res.status(500).json({ 
        success: false, 
        message: 'Server Error: ' + err.message 
      });
    }
  }
);

module.exports = router; 