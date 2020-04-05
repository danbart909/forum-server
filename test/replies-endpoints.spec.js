const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Replies Endpoints', function() {
  let db

  const {
    testThreads,
    testUsers,
  } = helpers.makeThreadsFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/replies`, () => {
    beforeEach('insert threads', () =>
      helpers.seedThreadTables(
        db,
        testUsers,
        testThreads,
      )
    )

    it(`creates an reply, responding with 201 and the new reply`, function() {
      this.retries(3)
      const testThread = testThreads[0]
      const testUser = testUsers[0]
      const newReply = {
        id: 1,
        author: 'test-user-1',
        content: 'Test new reply',
        threadid: testThread.id,
      }

      return supertest(app)
        .post('/api/replies')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newReply)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.content).to.eql(newReply.content)
          expect(res.body.threadid).to.eql(newReply.threadid)
          expect(res.body.id).to.eql(testUser.id)
          expect(res.headers.location).to.eql(`/api/replies/${res.body.id}`)
        })
        .expect(res =>
          db
            .from('replies')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.content).to.eql(newReply.content)
              expect(row.threadid).to.eql(newReply.threadid)
              expect(row.id).to.eql(testUser.id)
            })
        )
    })

    const requiredFields = ['content', 'threadid']

    requiredFields.forEach(field => {
      const testThread = testThreads[0]
      const testUser = testUsers[0]
      const newReply = {
        author: 'test author',
        content: 'Test new reply',
        threadid: testThread.id,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newReply[field]

        return supertest(app)
          .post('/api/replies')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newReply)
          .expect(400, {
            error: {message: `'${field}' is required`},
          })
      })
    })
  })
})
