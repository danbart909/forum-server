const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const TimetrackerService = require('./timetracker-service')
const { requireAuth } = require('../middleware/jwt-auth')

const timeRouter = express.Router()
const bodyParser = express.json()

timeRouter
  .route('/')

  .get((req, res, next) => {
    const db = req.app.get('db')
    TimetrackerService.getTime(db)
    .then(x => {
      res.json(x)
    })
    .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const db = req.app.get('db')
    newTime = new Date()

    TimetrackerService.insertTime(db, newTime)
      .then(time => {
        logger.info(`Time with id ${time.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${time.id}`))
          .json(time)
      })
      .catch(next)
  })

  timeRouter
    .route('/:time_id')

    .all((req, res, next) => {
      const { time_id } = req.params
      const db = req.app.get('db')
      TimetrackerService.getById(db, time_id)
        .then(time => {
          res.time = time
          next()
        })
        .catch(next)
    })

    .get((req, res) => {
      res.json(res.time)
    })

    .delete(requireAuth, (req, res, next) => {
      const { time_id } = req.params
      const db = req.app.get('db')
      TimetrackerService.deleteTime(db, time_id)
        .then(() => {
          logger.info(`Time with id ${time_id} deleted.`)
          res.status(204).end()
        })
        .catch(next)
      })

    .patch(requireAuth, bodyParser, (req, res, next) => {

      const newTime = new Date()

      const { time_id } = req.params
      const db = req.app.get('db')

      TimetrackerService.updateTime(db, time_id, newTime)
        .then(() => {
          res.status(204)
        })
        .catch(next)

    })

    module.exports = timeRouter