const mongoose = require('mongoose')
const config = require('config')
const db = config.get('mongoURI')


const connectDB = async () => {
  // Attempt to connect to db specified in config
  try {
    await mongoose
    .connect(db, { // Options are to silence deprication warnings
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    })

    console.log('MongoDB connected...')
  } 
  // If connection fails
  catch (err) {
    console.log(err.message)
    process.exit(1)
  }
}

module.exports = connectDB
