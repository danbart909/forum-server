const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const RepliesService = require('./replies-service')
const { requireAuth } = require('../middleware/jwt-auth')

const repliesRouter = express.Router()
const bodyParser = express.json()

const serializeReply = replies => ({
  id: replies.id,
  author: xss(replies.author),
  threadid: Number(replies.threadid),
  content: xss(replies.content),
  date_posted: replies.date_posted
})

serializeReplies = (replies) => {
  return replies.map(this.serializeReply)
}

repliesRouter
  .route('/')

  .get((req, res, next) => {
    const db = req.app.get('db')
    RepliesService.getReplies(db)
    .then(replies => {
      // res.json(replies.map(serializeReply))
      res.json(replies)
    })
    .catch(next)
  })

  .post(requireAuth, bodyParser, (req, res, next) => {
    const { author, threadid, content } = req.body
    const newReply = { author, threadid, content }
    const db = req.app.get('db')

    for (const field of ['author', 'threadid', 'content']) {
      if (!newReply[field]) {
        logger.error(`${field} is required`)
        return res.status(400).send({
          error: { message: `'${field}' is required` }
        })
      }
    }

    RepliesService.insertReply(db, newReply)
      .then(reply => {
        logger.info(`Reply with id ${reply.id} created.`)
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `${reply.id}`))
          .json(serializeReply(reply))
      })
      .catch(next)
  })

  repliesRouter
    .route('/:reply_id')

    .all((req, res, next) => {
      const { reply_id } = req.params
      const db = req.app.get('db')
      RepliesService.getById(db, reply_id)
        .then(reply => {
          if (!reply) {
            logger.error(`Reply with id ${reply_id} not found.`)
            return res.status(404).json({
              error: { message: `Reply Not Found` }
            })
          }
          res.reply = reply
          next()
        })
        .catch(next)
    })

    .get((req, res) => {
      // res.json(serializeReply(res.reply))
      res.json(res.reply)
    })

    .delete(requireAuth, (req, res, next) => {
      const { reply_id } = req.params
      const db = req.app.get('db')
      RepliesService.deleteReply(db, reply_id)
        .then(() => {
          logger.info(`Reply with id ${reply_id} deleted.`)
          res.status(204).end()
        })
        .catch(next)
      })

    .patch(requireAuth, bodyParser, (req, res, next) => {
      const { author, threadid, content } = req.body
      const newReply = { author, threadid, content }

      const numberOfValues = Object.values(newReply).filter(Boolean).length
      if (numberOfValues === 0) {
        logger.error(`Invalid update without required fields`)
        return res.status(400).json({
          error: {
            message: `Request body must content either 'author', 'threadid', or 'content'.`
          }
        })
      }

      const { reply_id } = req.params
      const db = req.app.get('db')

      RepliesService.updateReply(db, reply_id, newReply)
        .then(() => {
          res.status(204)
        })
        .catch(next)

    })

    module.exports = repliesRouter