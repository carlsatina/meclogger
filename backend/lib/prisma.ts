import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'
import path from 'path'
import { Pool } from 'pg'

const prismaEnvPath = path.resolve(process.cwd(), 'prisma/.env')

dotenv.config({ path: prismaEnvPath })
dotenv.config()

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL is not set in the environment')
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
