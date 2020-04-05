const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Threads Endpoints', function() {
  let db

  const {
    testThreads,
    testUsers,
    testReplies,
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

  describe(`GET /api/threads`, () => {
    context(`Given no threads`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/threads')
          .expect(200, [])
      })
    })

    context('Given there are threads in the database', () => {
      beforeEach('insert threads', () =>
        helpers.seedThreadTables(
          db,
          testUsers,
          testThreads,
          testReplies,
        )
      )

      it('responds with 200 and all of the threads', () => {
        const expectedThreads = testThreads.map(thread =>
          helpers.makeExpectedThread(
            testUsers,
            thread,
            testReplies,
          )
        )
        return supertest(app)
          .get('/api/threads')
          .expect(200, expectedThreads)
      })
    })
  })

  describe(`GET /api/threads/:threadid`, () => {
    context(`Given no threads`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const threadId = 123456
        return supertest(app)
          .get(`/api/threads/${threadId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: {message: `Thread Not Found`} })
      })
    })

    context('Given there are threads in the database', () => {
      beforeEach('insert threads', () =>
        helpers.seedThreadTables(
          db,
          testUsers,
          testThreads,
          testReplies,
        )
      )

      it('responds with 200 and the specified thread', () => {
        const threadId = 2
        const expectedThread = helpers.makeExpectedThread(
          testUsers,
          testThreads[threadId - 1],
          testReplies,
        )

        return supertest(app)
          .get(`/api/threads/${threadId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedThread)
      })
    })
  })

  describe(`GET /api/threads/:threadid/replies`, () => {
    context(`Given no threads`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )

      it(`responds with 404`, () => {
        const threadId = 123456
        return supertest(app)
          .get(`/api/threads/${threadId}/replies`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, {})
      })
    })

    context('Given there are replies for thread in the database', () => {
      beforeEach('insert threads', () =>
        helpers.seedThreadTables(
          db,
          testUsers,
          testThreads,
          testReplies,
        )
      )

      it('responds with 200 and the specified replies', () => {
        const threadId = 1
        const expectedReplies = helpers.makeExpectedThreadReplies(
          testUsers, threadId, testReplies
        )

        return supertest(app)
          .get(`/api/replies/${threadId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedReplies)
      })
    })
  })
})
