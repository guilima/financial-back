import { postgres } from '../mongodb';

const authRegister = async (user, login) => {
  const client = await postgres().connect();
  try {
    await client.query('BEGIN')
    const insertUser = 'INSERT INTO users(user_name, full_name, email, created_at) VALUES($1, $2, $3, $4) RETURNING id';
    const res = await client.query(insertUser, Object.values(user));
    const insertLogin = 'INSERT INTO logins(password_hash, password_salt, ip_address, user_id) VALUES($1, $2, $3, $4)';
    await client.query(insertLogin, Object.values(login).concat(res.rows[0].id));
    const insertUserRole = 'INSERT INTO users_roles(user_id, role_id) VALUES($1, $2)';
    await client.query(insertUserRole, [res.rows[0].id, 0]);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

const authLogin = async (email) => {
  const client = await postgres().connect();
  try {
    await client.query('BEGIN')
    const selectUser = 'SELECT u.id, u.full_name, l.password_hash, l.password_salt FROM users as u INNER JOIN logins as l ON u.id = l.user_id WHERE u.email = $1 AND u.deleted_at IS NULL';
    const res = await client.query(selectUser, [email]);
    return res.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

const authVerify = async (userId) => {
  const client = await postgres().connect();
  try {
    await client.query('BEGIN')
    const selectUser = 'SELECT u.id, u.full_name FROM users as u WHERE u.id = $1 AND u.deleted_at IS NULL';
    const res = await client.query(selectUser, [userId]);
    return res.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

export {
  authRegister,
  authLogin,
  authVerify,
}