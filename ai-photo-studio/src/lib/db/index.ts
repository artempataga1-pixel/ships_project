import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import { mkdirSync } from 'fs'
import path from 'path'
import * as schema from './schema'

const dbPath = path.join(process.cwd(), 'data', 'app.db')
mkdirSync(path.dirname(dbPath), { recursive: true })

const sqlite = new Database(dbPath)
export const db = drizzle({ client: sqlite, schema })
