/**
 * tests/env.setup.js
 * Loads server/.env.test if it exists (recommended — a separate throwaway
 * database), otherwise falls back to the regular server/.env. Either way,
 * DO NOT point this at a database you care about: tests wipe their own
 * rows between runs but a mistake here would run against real data.
 */
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const testEnvPath = path.join(__dirname, '..', '.env.test')
const fallbackEnvPath = path.join(__dirname, '..', '.env')

dotenv.config({ path: existsSync(testEnvPath) ? testEnvPath : fallbackEnvPath })
