require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const cors = require('cors')
const { NODE_ENV } = require('./config')
const errorHandler = require('./error-handler')
const repliesRouter = require('./replies/replies-router')
const threadsRouter = require('./threads/threads-router')
const authRouter = require('./auth/auth-router')
const usersRouter = require('./users/users-router')
const timeRouter = require('./timetracker/timetracker-router')

const app = express()

app
  .use(morgan((NODE_ENV === 'production') ? 'tiny' : 'common', {
    skip: () => NODE_ENV === 'test'
  }))
  .use(helmet())
  .use(cors())
  .use(express.json())
  .use('/api/threads', threadsRouter)
  .use('/api/replies', repliesRouter)
  .use('/api/auth', authRouter)
  .use('/api/users', usersRouter)
  .use('/api/time', timeRouter)

app.use(errorHandler)

module.exports = app