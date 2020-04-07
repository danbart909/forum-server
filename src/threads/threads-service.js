const ThreadsService = {
  getThreads(knex) {
    return knex('threads')
      .select('*')
      .orderBy('timetracker.date_modified', 'desc')
  },
  getAllThreads(knex) {
    return knex.select('*').from('threads').orderBy('date_modified', 'desc')
  },
  getById(knex, id) {
    return knex.from('threads').select('*').where('id', id).first()
  },
  insertThread(knex, newThread) {
    return knex
      .insert(newThread)
      .into('threads')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteThread(knex, id) {
    return knex('threads')
      .where({ id })
      .delete()
  },
  updateThread(knex, id, newThreadsFields) {
    return knex('threads')
      .where({ id })
      .update(newThreadsFields)
  },
  updateThreadDate(knex, id) {
    return knex('threads')
      .where({ id })
      .update({ date_modified: new Date() })
  }
}

module.exports = ThreadsService