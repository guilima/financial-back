import { psqlKnex } from '@root/db';

const userFindByEmail = async (email: string) => {
  try {
    const user = await psqlKnex('users').select('*')
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