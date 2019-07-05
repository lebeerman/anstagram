module.exports = {
  test: {
    client: 'pg',
    connection: 'postgres://localhost/test_anstagram_db',
    migrations: {
      directory: `${__dirname}/server/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/server/db/seeds`,
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  development: {
    client: 'pg',
    connection: 'postgres://localhost/development_anstagram_db',
    migrations: {
      directory: `${__dirname}/server/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/server/db/seeds`,
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: `${__dirname}/server/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/server/db/seeds`,
    },
    pool: {
      min: 2,
      max: 10,
    },
  },
};
