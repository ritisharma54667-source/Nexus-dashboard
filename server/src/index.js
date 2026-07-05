/**
 * index.js — Nexus Dashboard API entry point.
 * Boots the Express app built in app.js and starts listening.
 */

import 'dotenv/config'
import { createApp } from './app.js'

const app = createApp()
const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`✔ Nexus Dashboard API running on http://localhost:${PORT}`)
})
