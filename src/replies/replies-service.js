const RepliesService = {
  getReplies(knex) {
    return knex
      .from('replies')
      .select('*')
      .orderBy('id', 'asc')
  },
  getAllReplies(knex) {
    return knex.select('*').from('replies').orderBy('id', 'asc')
  },
  getById(knex, id) {
    return knex.from('replies').select('*').where('threadid', id).orderBy('id', 'asc')
  },
  insertReply(knex, newReply) {
    return knex
      .insert(newReply)
      .into('replies')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteReply(knex, id) {
    return knex('replies')
      .where({ id })
      .delete()
  },
  updateReply(knex, id, newReplyFields) {
    return knex('replies')
      .where({ id })
      .update(newReplyFields)
  },
}

module.exports = RepliesService