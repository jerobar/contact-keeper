const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator/check')

const config = require('config')
const User = require('../models/User')
const auth = require('../middleware/auth')


// @route   GET api/auth
// @desc    Get logged in user
// @access  Private
router.get('/', auth, 
async (req, res) => {
  // Get user from db
  try {
    // Return all user data EXCEPT password
    const user = await User.findById(req.user.id).select('-password')
    res.json(user)
  } 
  // User not retrieved from db
  catch(err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

// @route   POST api/auth
// @desc    Auth user and get token
// @access  Public
router.post('/', [
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Password is required').exists()
],
async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req)
  // If validation errors
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() })
  }

  // Destructure posted credentials
  const { email, password } = req.body

  // Attempt to validate user
  try {
    // Check if user exists (by email)
    let user = await User.findOne({ email })

    // If the user does not exist
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' })
    }

    // Compare posted password and user password's hashes
    const isMatch = await bcrypt.compare(password, user.password)

    // If password hashes do not match
    if(!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' })
    }

    // Create jwt payload
    const payload = {
      user: {
        id: user.id
      }
    }

    // Generate jwt
    jwt.sign(payload, config.get('jwtSecret'), {
      expiresIn: 360000
    }, (err, token) => {
      if (err) throw err
      // If jwt successfully created, send to user
      res.json({ token })
    })
  } 
  // If user validation fails
  catch(err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }

})

module.exports = router
