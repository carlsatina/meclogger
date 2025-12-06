import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import path from 'path'
import { Pool, defaults as pgDefaults } from 'pg'

const prismaEnvPath = path.resolve(process.cwd(), 'prisma/.env')

dotenv.config({ path: prismaEnvPath })
dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in the environment')
}

// Pragmatic TLS bypass for self-signed certs (Supabase/pgBouncer):
// allow TLS but skip certificate validation.
pgDefaults.ssl = { rejectUnauthorized: false }
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

// Pragmatic TLS fix for Supabase/pgBouncer with self-signed root:
// allow self-signed certs while keeping TLS encryption.
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
})
const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({ adapter })

export default prisma
