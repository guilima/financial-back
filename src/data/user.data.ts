import { postgres } from '../mongodb';

const userFindByEmail = async (email: string) => {
  const client = await postgres().connect();
  try {
    await client.query('BEGIN')
    const selectUser = 'SELECT * FROM users WHERE email = $1 AND deleted_at IS NULL';
    const res = await client.query(selectUser, [email]);
    return res.rows[0];
  } catch (err) {
    throw err;
  } finally {
    client.release();
  }
}

export {
  userFindByEmail
}