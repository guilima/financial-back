import { psqlKnex } from '@root/db';

const authRegister = async (user: {[key: string]: string}, login: {[key: string]: any}) => {
  const trxProvider = psqlKnex.transactionProvider();
  const trx = await trxProvider();
  try {
    const userId = await trx('users').insert(user, 'id');
    await trx('logins').insert(Object.assign(login, {user_id: userId[0]}));
    await trx('users_roles').insert({user_id: userId[0], role_id: 1});
    await trx.commit();
    return userId[0];
  } catch (err) {
    await trx.rollback()
    throw err;
  }
}

const authLogin = async (email: string) => {
  try {
    const user = await psqlKnex.select('u.id', 'u.full_name', 'l.password_hash', 'l.password_salt')
      .from('users AS u')
      .innerJoin('logins AS l', 'l.user_id', 'u.id')
      .whereNull('u.deleted_at')
      .andWhere('u.email', '=', email);
    return user[0];
  } catch (err) {
    throw err;
  }
}

const authUpdateLogin = async(data: {loggedAt: Date}, id: number) => {
  try {
    const login = await psqlKnex('logins').where('user_id', '=', id).update(data);
    return login[0];
  } catch (err) {
    throw err;
  }
}

const authVerify = async (userId) => {
  try {
    const user = await psqlKnex('users').select('id', 'full_name')
      .whereNull('deleted_at')
      .andWhere('id', '=', userId);
    return user[0];
  } catch (err) {
    throw err;
  }
}

export {
  authRegister,
  authLogin,
  authUpdateLogin,
  authVerify,
}