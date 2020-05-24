import { postgresConfig } from './db';

export const development = postgresConfig;
export const production = Object.assign(postgresConfig, {
  pool: {
    min: 2,
    max: 10
  }
});
