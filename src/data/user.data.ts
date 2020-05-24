import { postgres } from '../../db';

const userFindByEmail = async (email: string) => {
  const knex = await postgres();
  try {
    const user = await knex('users').select('*')
      .whereNull('deleted_at')
      .andWhere('email', '=', email);
    return user[0];
  } catch (err) {
    throw {err};
  }
}

export {
  userFindByEmail
}