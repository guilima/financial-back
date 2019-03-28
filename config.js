module.exports = {
  db: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME_DEVELOPMENT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
  },
  port: process.env.PORT
};