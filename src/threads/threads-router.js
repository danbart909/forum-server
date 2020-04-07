const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const ThreadsService = require('./threads-service')
const { requireAuth } = require('../middleware/jwt-auth')

const threadsRouter = express.Router()
const bodyParser = express.json()

const serializeThreads = thread => ({
  id: thread.id,
  author: xss(thread.author),
  name: xss(thread.name),
  op: xss(thread.op),
  date_created: thread.date_created
})

threadsRouter
  .route('/')

  .get((req, res, next) => {
    const db = req.app.get('db')
    ThreadsService.getAllThreads(db)
    .then(threads => {
      // res.json(threads.map(serializeThreads))
      res.json(threads)
    })
    .catch(next)
  })

  .post(requireAuth, bodyParser, (req, res, next) => {
    const { author, name, op } = req.body
    const newThread = { author, name, op }
    const db = req.app.get('db')

    for (const field of ['author', 'name', 'op']) {
      if (!newThread[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }

    ThreadsService.insertThread(db, newThread)
      .then(thread => {
        ThreadsService.updateThreadDate(db, thread.id)
          .then(() => {
            res.status(204)
          })
      .catch(next)
        logger.info(`Thread with id ${thread.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${thread.id}`))
          .json(serializeThreads(thread))
      })
      .catch(next)
  })

  threadsRouter
    .route('/:thread_id')

    .all((req, res, next) => {
      const { thread_id } = req.params
      const db = req.app.get('db')
      ThreadsService.getById(db, thread_id)
        .then(thread => {
          if (!thread) {
            logger.error(`Thread with id ${thread_id} not found.`)
            return res.status(404).json({
              error: { message: `Thread Not Found` }
            })
          }
          res.thread = thread
          next()
        })
        .catch(next)
    })

    .get((req, res) => {
      res.json(serializeThreads(res.thread))
    })

    .delete(requireAuth, (req, res, next) => {
      const { thread_id } = req.params
      const db = req.app.get('db')
      ThreadsService.deleteThread(db, thread_id)
        .then(() => {
          logger.info(`Thread with id ${thread_id} deleted.`)
          res.status(204).end()
        })
        .catch(next)
      })

    .patch(requireAuth, bodyParser, (req, res, next) => {
      const { author, name, op } = req.body
      const newThreads = { author, name, op }

      const numberOfValues = Object.values(newThreads).filter(Boolean).length
      if (numberOfValues === 0) {
        logger.error(`Invalid update without required fields`)
        return res.status(400).json({
          error: {
            message: `Request body must contain either 'author', 'name', or 'op'.`
          }
        })
      }

      const { thread_id } = req.params
      const db = req.app.get('db')

      ThreadsService.updateThread(db, thread_id, newThreads)
        .then(() => {
          res.status(204)
        })
        .catch(next)

    })

    module.exports = threadsRouter