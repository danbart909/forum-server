const ThreadsService = {
  getThreads(knex) {
    return knex
      .from('threads')
      .select('*')
      .orderBy('id', 'asc')
      // .innerjoin('timetracker', 'threads.id', '=', 'timetracker.id')
  },
  getAllThreads(knex) {
    return knex.select('*').from('threads').orderBy('id', 'asc')
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
}

module.exports = ThreadsService