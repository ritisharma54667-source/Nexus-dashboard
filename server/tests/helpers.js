import './env.setup.js'
import { createApp } from '../src/app.js'
import { pool } from '../src/db/pool.js'

export const app = createApp()

// Deletes only rows created by test accounts (email ending in
// @nexus-test.local) so this is safe to run against a shared dev DB
// too, though a dedicated .env.test database is still recommended.
export async function cleanupTestUsers() {
  const orgs = await pool.query(`
    SELECT om.organization_id FROM organization_members om
    JOIN users u ON u.id = om.user_id
    WHERE u.email LIKE '%@nexus-test.local'
  `)
  const orgIds = orgs.rows.map((r) => r.organization_id)

  await pool.query(`DELETE FROM users WHERE email LIKE '%@nexus-test.local'`)

  if (orgIds.length > 0) {
    await pool.query(`DELETE FROM organizations WHERE id = ANY($1::uuid[])`, [orgIds])
  }
}

export function uniqueTestEmail(label) {
  return `${label}-${Date.now()}-${Math.floor(Math.random() * 10000)}@nexus-test.local`
}
