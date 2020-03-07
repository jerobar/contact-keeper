const express = require('express')
const router = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator/check')

const config = require('config')
const User = require('../models/User')


// @route   POST api/users
// @desc    Register a user
// @access  Public
router.post('/', [
  // Validate incoming user data
  check('name', 'Name is required').not().isEmpty(),
  check('email', 'Please include a valid email').isEmail(),
  check('password', 'Please enter a password with six or more characters').isLength({ min: 6 })
],
async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req)
  // If validation errors, respond with a 400 message
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() })

  // Destructure posted user data
  const { name, email, password } = req.body

  // Register user
  try {
    // Check for existing user by email
    let user = await User.findOne({ email })

    // If user already exists, respond with a 400 message
    if (user) return res.status(400).json({ msg: 'User already exists' })

    // Create a new instance of User
    user = new User({
      name,
      email,
      password
    })

    // Generate a salt
    const salt = await bcrypt.genSalt(10)

    // Hash user's password
    user.password = await bcrypt.hash(password, salt)

    // Save user to db
    await user.save()

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
  // If error registering user
  catch (err) {
    console.error(err.message)
    res.status(500).send('Server Error')
  }
})

module.exports = router
