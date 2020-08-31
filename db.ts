import { postgresURI, redisURI } from './config';
import Knex from 'knex';
import pkg from 'objection';
const { knexSnakeCaseMappers } = pkg;
import Redis from 'koa-redis';

export const postgresConfig: Knex.Config = {
  client: 'pg',
  connection: postgresURI,
  ...knexSnakeCaseMappers()
};

export const psqlKnex = Knex(postgresConfig);
export const redisStore = Redis({url: redisURI});
