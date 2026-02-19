import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const globalForPrisma = globalThis

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in environment variables')
    console.error('📝 Please check your .env file or environment configuration')
    throw new Error('DATABASE_URL is not defined')
  }

  console.log('✅ DATABASE_URL found, connecting to database...')

  const pool = new Pool({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })
  
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({ 
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma