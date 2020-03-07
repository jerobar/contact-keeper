const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token')

  // If no token is sent
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' })

  try {
    // Verify token
    const decoded = jwt.verify(token, config.get('jwtSecret')) // decoded = token payload

    // Assign user from decoded token payload to req user
    req.user = decoded.user
    next()
  } catch(err) {
    res.status(401).json({ msg: 'Token is not valid' })
  }
}
