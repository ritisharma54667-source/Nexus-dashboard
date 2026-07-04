/**
 * db/setup.js
 *
 * Applies schema.sql to whatever database DATABASE_URL points at.
 * Run with: npm run db:setup
 * Safe to re-run — every statement is CREATE ... IF NOT EXISTS.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { pool } from './pool.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main() {
  const sql = readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8')
  console.log('▶ Applying schema.sql ...')
  await pool.query(sql)
  console.log('✔ Database schema is up to date.')
  await pool.end()
}

main().catch((err) => {
  console.error('✖ Failed to apply schema:', err.message)
  process.exit(1)
})
