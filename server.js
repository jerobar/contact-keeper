// Import modules ("CommonJS" import syntax)
const express = require('express')
const connectDB = require('./config/db')
const path = require('path')


// Initialize Express app
const app = express()

// Connect db
connectDB()

// Initialize Middleware
app.use(express.json({ extended: false }))

// Dev - '/' route
// app.get('/', (req, res) => {
//   res.json({ msg: "Welcome to the ContactKeeper API" })
// })

// Define routes
app.use('/api/users', require('./routes/users'))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/contacts', require('./routes/contacts'))

// Serve static assets in production
if (process.env.node_env === 'production') {
  // Set static folder
  app.use(express.static('client/build'))

  app.get('*', (req, res) => res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html')))
}

// Define port
const PORT = process.env.PORT || 5000

// Start server
app.listen(PORT, console.log(`Server started on port ${PORT}`))
