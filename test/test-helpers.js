const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      username: 'test-user-1',
      realname: 'Test user 1',
      password: 'password',
      date_joined: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 2,
      username: 'test-user-2',
      realname: 'Test user 2',
      password: 'password',
      date_joined: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 3,
      username: 'test-user-3',
      realname: 'Test user 3',
      password: 'password',
      date_joined: new Date('2029-01-22T16:28:32.615Z'),
    },
    {
      id: 4,
      username: 'test-user-4',
      realname: 'Test user 4',
      password: 'password',
      date_joined: new Date('2029-01-22T16:28:32.615Z'),
    },
  ]
}

function makeThreadsArray(users) {
  return [
    {
      id: 1,
      author: "test-user-1",
      name: 'First test post!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      op: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 2,
      author: "test-user-2",
      name: 'Second test post!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      op: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 3,
      author: "test-user-3",
      name: 'Third test post!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      op: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
    {
      id: 4,
      author: "test-user-4",
      name: 'Fourth test post!',
      date_created: new Date('2029-01-22T16:28:32.615Z'),
      op: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
    },
  ]
}

function makeRepliesArray(users, threads) {
  return [
    {
      id: 1,
      content: 'First test comment!',
      threadid: threads[0].id,
      author: users[0].username,
      date_posted: new Date()
    },
    {
      id: 2,
      content: 'Second test comment!',
      threadid: threads[0].id,
      author: users[1].username,
      date_posted: new Date()
    },
    {
      id: 3,
      content: 'Third test comment!',
      threadid: threads[0].id,
      author: users[2].username,
      date_posted: new Date()
    },
    {
      id: 4,
      content: 'Fourth test comment!',
      threadid: threads[0].id,
      author: users[3].username,
      date_posted: new Date()
    },
    {
      id: 5,
      content: 'Fifth test comment!',
      threadid: threads[threads.length - 1].id,
      author: users[0].username,
      date_posted: new Date()
    },
    {
      id: 6,
      content: 'Sixth test comment!',
      threadid: threads[threads.length - 1].id,
      author: users[2].username,
      date_posted: new Date()
    },
    {
      id: 7,
      content: 'Seventh test comment!',
      threadid: threads[3].id,
      author: users[0].username,
      date_posted: new Date()
    },
  ];
}

function makeExpectedThread(users, thread, replies=[]) {
  const author = users
    .find(user => user.id === thread.author_id)

  const number_of_replies = replies
    .filter(reply => reply.threadid === thread.id)
    .length

  return {
    id: thread.id,
    author: thread.author,
    name: thread.name,
    op: thread.op,
    date_created: thread.date_created.toISOString()
  }
}

function makeExpectedThreadReplies(users, threadId, replies) {
  const expectedReplies = replies
    .filter(reply => reply.threadid === threadId)

  return expectedReplies.map(reply => {
    const replyUser = users.find(user => user.username == reply.author)
    return {
      id: reply.id,
      content: reply.content,
      author: reply.author,
      date_posted: reply.date_posted.toISOString(),
      threadid: reply.threadid
    }
  })
}

function makeMaliciousThread(user) {
  const maliciousThread = {
    id: 911,
    style: 'How-to',
    date_created: new Date(),
    name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    author_id: user.id,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
  }
  const expectedThread = {
    ...makeExpectedThread([user], maliciousThread),
    name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
  }
  return {
    maliciousThread,
    expectedThread,
  }
}

function makeThreadsFixtures() {
  const testUsers = makeUsersArray()
  const testThreads = makeThreadsArray(testUsers)
  const testReplies = makeRepliesArray(testUsers, testThreads)
  return { testUsers, testThreads, testReplies }
}

function cleanTables(db) {
  return db.transaction(trx =>
    trx.raw(
      `TRUNCATE
        users,
        threads,
        replies
      `
    )
    .then(() =>
      Promise.all([
        trx.raw(`ALTER SEQUENCE threads_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
        trx.raw(`ALTER SEQUENCE replies_id_seq minvalue 0 START WITH 1`),
        trx.raw(`SELECT setval('threads_id_seq', 0)`),
        trx.raw(`SELECT setval('users_id_seq', 0)`),
        trx.raw(`SELECT setval('replies_id_seq', 0)`),
      ])
    )
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedThreadTables(db, users=[], threads=[], replies=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('threads').insert(threads)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('threads_id_seq', ?)`,
      [threads[threads.length - 1].id],
    )
    // only insert comments if there are some, also update the sequence counter
    if (replies.length) {
      await trx.into('replies').insert(replies)
      await trx.raw(
        `SELECT setval('replies_id_seq', ?)`,
        [replies[replies.length - 1].id],
      )
    }
  })
}

function seedMaliciousThread(db, user, thread) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('threads')
        .insert([thread])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ author: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makeThreadsArray,
  makeExpectedThread,
  makeExpectedThreadReplies,
  makeMaliciousThread,
  makeRepliesArray,
  makeThreadsFixtures,
  cleanTables,
  seedThreadTables,
  seedMaliciousThread,
  makeAuthHeader,
  seedUsers,
}
