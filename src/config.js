module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:401923@localhost/forum',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres:401923@localhost/forum-test',
  JWT_SECRET: process.env.JWT_SECRET || 'secret',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d'
}