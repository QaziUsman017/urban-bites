const cors = require('cors')
const dotenv = require('dotenv')
const express = require('express')
const mongoose = require('mongoose')

const orderRoutes = require('./routes/orders')

dotenv.config()

const app = express()
const port = process.env.PORT || 5001
const mongoUri = process.env.MONGO_URI

app.use(cors())
app.use(express.json())

// Health check
app.get('/api/health', (_request, response) => {
  response.json({
    message: 'Urban Bites API is running',
  })
})

// Orders API
app.use('/api/orders', orderRoutes)

async function startServer() {
  if (!mongoUri) {
    console.error(
      'MONGO_URI is not configured. Add it to the .env file.'
    )
    process.exit(1)
  }

  try {
    await mongoose.connect(mongoUri)

    console.log('Connected to MongoDB')

    app.listen(port, () => {
      console.log(
        `Urban Bites API listening on port ${port}`
      )
    })
  } catch (error) {
    console.error(
      'MongoDB connection failed:',
      error.message
    )

    process.exit(1)
  }
}

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error.message)
})

startServer()