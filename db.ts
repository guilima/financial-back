import { postgresURI } from './config';
import Knex from 'knex';
import { knexSnakeCaseMappers } from 'objection';

export const postgresConfig: Knex.Config = {
  client: 'pg',
  connection: postgresURI,
  ...knexSnakeCaseMappers()
};
export const postgres = async(): Promise<Knex> => Knex(postgresConfig);
