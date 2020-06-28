import { postgresURI, redisURI } from './config';
import Knex from 'knex';
import { knexSnakeCaseMappers } from 'objection';
import Redis from 'koa-redis';

export const postgresConfig: Knex.Config = {
  client: 'pg',
  connection: postgresURI,
  ...knexSnakeCaseMappers()
};
export const postgres = async(): Promise<Knex> => Knex(postgresConfig);
export const redisStore = Redis({url: redisURI});