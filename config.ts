const db = {
  host: process.env.DB_HOST,
  database: process.env.DB_NAME_DEVELOPMENT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
};
const port = process.env.PORT;
const jwtToken = process.env.JWT_TOKEN;

export {
  db,
  port,
  jwtToken
}