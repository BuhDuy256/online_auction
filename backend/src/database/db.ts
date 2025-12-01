import knex from 'knex';
import { envConfig } from '../config/env.config';

export default knex({
  client: 'pg',
  connection: {
    host: envConfig.SUPABASE_HOST,
    port: envConfig.SUPABASE_PORT,
    user: envConfig.SUPABASE_USER,
    password: envConfig.SUPABASE_PASSWORD,
    database: envConfig.SUPABASE_DB,
    ssl: { rejectUnauthorized: false }
  },
  pool: { min: 0, max: 5 },
});