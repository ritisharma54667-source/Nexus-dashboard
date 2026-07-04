/**
 * db/pool.js
 *
 * Single shared PostgreSQL connection pool. Import `query()` anywhere
 * you need to talk to the database — don't create new Pool instances
 * elsewhere in the app.
 */

import pg from 'pg'
import 'dotenv/config'

const { Pool } = pg

if (!process.env.DATABASE_URL) {
  console.error('✖ DATABASE_URL is not set. Copy server/.env.example to server/.env and fill it in.')
  process.exit(1)
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Neon and most hosted Postgres providers require SSL. Local Postgres
  // usually doesn't — this checks the connection string for a hint.
  ssl: process.env.DATABASE_URL.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : false,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle Postgres client', err)
})

export function query(text, params) {
  return pool.query(text, params)
}
