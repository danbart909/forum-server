const path = require('path')
const express = require('express')
const xss = require('xss')
const logger = require('../logger')
const UsersService = require('./users-service')
const { requireAuth } = require('../middleware/jwt-auth')

const usersRouter = express.Router()
const bodyParser = express.json()

const serializeUser = user => ({
  id: user.id,
  realname: xss(user.realname),
  username: xss(user.username),
  password: xss(user.password),
  date_joined: user.date_joined
})

serializeUsers = (users) => {
  return users.map(this.serializeUser())
}

usersRouter
  .route('/')

  .get((req, res, next) => {
    const db = req.app.get('db')
    UsersService.getUsers(db)
    .then(user => {
      res.json(user)
    })
    .catch(next)
  })

  .post(bodyParser, (req, res, next) => {
    const newUser = req.body
    const db = req.app.get('db')
    const { username, realname, password } = newUser

    UsersService.hasUserWithUserName(
      db,
      username
    )
      .then(hasUserWithUserName => {
        if (hasUserWithUserName)
          return res.status(400).json({ error: `Username already taken` })

        return UsersService.hashPassword(password)
          .then(hashedPassword => {
            const newUserHashed = {
              username,
              realname,
              password: hashedPassword,
              date_joined: 'now()',
            }

            return UsersService.insertUser(
              db,
              newUserHashed
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl, `/`))
              })
              .catch(next)
          })
          .catch(next)
      })
      .catch(next)
  })

  usersRouter
    .route('/:user_id')

    .all((req, res, next) => {
      const { user_id } = req.params
      const db = req.app.get('db')
      UsersService.getById(db, user_id)
        .then(user => {
          if (!user) {
            logger.error(`User with id ${user_id} not found.`)
            return res.status(404).json({
              error: { message: `User Not Found` }
            })
          }
          res.user = user
          next()
        })
        .catch(next)
    })

    .get((req, res) => {
      res.json(res.user)
    })

    .delete(requireAuth, (req, res, next) => {
      const { user_id } = req.params
      const db = req.app.get('db')
      UsersService.deleteUser(db, user_id)
        .then(() => {
          logger.info(`User with id ${user_id} deleted.`)
          res.status(204).end()
        })
        .catch(next)
      })

    .patch(requireAuth, bodyParser, (req, res, next) => {
      const { realname, username, password, slackname } = req.body
      const newUser = { realname, username, password, slackname }

      const numberOfValues = Object.values(newUser).filter(Boolean).length
      if (numberOfValues === 0) {
        logger.error(`Invalid update without required fields`)
        return res.status(400).json({
          error: {
            message: `Request body must content either 'realname', 'username', 'password', or 'slackname'.`
          }
        })
      }

      const { user_id } = req.params
      const db = req.app.get('db')

      UsersService.updateUser(db, user_id, newUser)
        .then(() => {
          res.status(204).end()
        })
        .catch(next)

    })

    module.exports = usersRouter