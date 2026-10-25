import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { getEnv } from '../config/env';
import * as schema from './schema';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

export function getDbPool(): pg.Pool {
  if (!pool) {
    const env = getEnv();
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      min: env.DATABASE_POOL_MIN,
      max: env.DATABASE_POOL_MAX,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
    });

    pool.on('error', (err) => {
      // Avoid crashing server if connection drops; health probe will accurately reflect status
      console.error('Unexpected error on idle PostgreSQL client:', err);
    });
  }
  return pool;
}

export function getDb() {
  if (!db) {
    const activePool = getDbPool();
    db = drizzle(activePool, { schema });
  }
  return db;
}
