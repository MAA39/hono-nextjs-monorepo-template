import { createDb, type Database } from "@repo/db/client"

let db: Database | null = null

export const getDb = (): Database => {
  if (!db) {
    db = createDb(process.env.DATABASE_URL!)
  }
  return db
}
