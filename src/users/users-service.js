const bcrypt = require('bcryptjs')

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/

const UsersService = {
  getUsers(knex) {
    return knex
      .from('users')
      .select('*')
  },
  getAllUsers(knex) {
    return knex.select('*').from('users')
  },
  getById(knex, id) {
    return knex.from('users').select('*').where('id', id)
  },
  insertUser(knex, newReply) {
    return knex
      .insert(newReply)
      .into('users')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteUser(knex, id) {
    return knex('users')
      .where({ id })
      .delete()
  },
  updateUser(knex, id, newReplyFields) {
    return knex('users')
      .where({ id })
      .update(newReplyFields)
  },
  validatePassword(password) {
    // if (password.length < 7) {
    //   return 'Password be longer than 7 characters'
    // }
    // if (password.length > 72) {
    //   return 'Password be less than 72 characters'
    // }
    // if (password.startsWith(' ') || password.endsWith(' ')) {
    //   return 'Password must not start or end with empty spaces'
    // }
    // if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
    //   return 'Password must contain one upper case, lower case, number and special character'
    // }
    return null
  },
  hashPassword(password) {
    return bcrypt.hash(password, 12)
  },
  hasUserWithUserName(db, username) {
    return db('users')
      .where({ username })
      .first()
      .then(user => !!user)
  }
}

module.exports = UsersService