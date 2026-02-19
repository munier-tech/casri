import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import dotenv from 'dotenv'

dotenv.config()

const globalForPrisma = globalThis

const prismaClientSingleton = () => {
  console.log('🔧 Creating Prisma Client...')
  
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  console.log('✅ DATABASE_URL found')

  // Create PostgreSQL connection pool
  const pool = new Pool({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  })
  
  // Create Prisma adapter - this is REQUIRED for Prisma 7+
  const adapter = new PrismaPg(pool)
  
  // Pass adapter directly - this satisfies the requirement
  return new PrismaClient({
    adapter, // This is the key! It must be passed directly
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}