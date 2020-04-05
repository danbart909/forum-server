const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const TimetrackerService = require('./timetracker-service')
const { requireAuth } = require('../middleware/jwt-auth')

const timeRouter = express.Router()
const bodyParser = express.json()

// const serializeThreads = thread => ({
//   id: thread.id,
//   author: xss(thread.author),
//   name: xss(thread.name),
//   op: xss(thread.op),
//   date_created: thread.date_created
// })

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
    // const { id, time } = req.body
    const db = req.app.get('db')
    console.log(req.body)
    newTime = new Date()

    // for (const field of ['author', 'name', 'op']) {
    //   if (!newTime[field]) {
    //     logger.error(`${field} is required`)
    //     return res.status(400).send({
    //       error: { message: `'${field}' is required` }
    //     })
    //   }
    // }

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
        //   if (!time) {
        //     logger.error(`Thread with id ${time_id} not found.`)
        //     return res.status(404).json({
        //       error: { message: `Thread Not Found` }
        //     })
        //   }
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

      console.log(req.body, req.params)

      TimetrackerService.updateTime(db, time_id, newTime)
        .then(() => {
          res.status(204)
        })
        .catch(next)

    })

    module.exports = timeRouter