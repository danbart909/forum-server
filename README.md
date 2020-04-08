# Thinkful Forum (Server)

## Links

Live Client hosted by Ziet: https://forum-client-delta.now.sh/

Thinkful Forum Client GitHub Repo: https://github.com/danbart909/forum-client

## Summary/Description/API Documentation

This is the server for the Thinkful Forum.

/api/threads - GET & POST
/api/threads/:thread_id - GET, DELETE, & PATCH

/api/replies - GET & POST
/api/replies/:reply_id - GET, DELETE, & PATCH

/api/users - GET & POST
/api/users/:users_id - GET, DELETE, & PATCH

/api/auth/login - POST
/api/auth/refresh - POST

## Installation

```
npm install
```

Nothing is required beyond the initial 'npm install'. All required dependencies should be downloaded.

## Dependencies/Tech Info

The server is based on node.js and uses express.js/knex to connect to the database, which uses postgresql. Jwt is used for authentication.

express.js, node.js, postgresql, knex, jwt

## Screenshots

![forum view](https://i.imgur.com/HZ7pWO9.png "forum-view")

![thread view](https://i.imgur.com/itKCeCp.png "thread-view")

![landing page](https://i.imgur.com/0meUB4F.png "landing-page")