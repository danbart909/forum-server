const TimetrackerService = {
  getTime(knex) {
    return knex
      .from('timetracker')
      .select('*')
      .orderBy('id', 'asc')
  },
  getAllTime(knex) {
    return knex.select('*').from('timetracker').orderBy('id', 'asc')
  },
  getById(knex, id) {
    return knex.from('timetracker').select('*').where('id', id).first()
  },
  insertTime(knex, newTime) {
    return knex
      .insert(newTime)
      .into('timetracker')
      .returning('*')
      .then(rows => {
        return rows[0]
      })
  },
  deleteTime(knex, id) {
    return knex('timetracker')
      .where({ id })
      .delete()
  },
  updateTime(knex, id, newTime) {
    return knex('timetracker')
      .where({ id })
      .update(newTime)
  },
}

module.exports = TimetrackerService