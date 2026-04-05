import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL
  
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined')
  }

  // Log environment (without exposing secrets)
  console.log('📊 Node Environment:', process.env.NODE_ENV)
  console.log('📊 Vercel Environment:', process.env.VERCEL === '1' ? 'Yes' : 'No')
  console.log('📊 Database URL exists:', !!connectionString)

  // Configure pool for serverless
  const pool = new Pool({ 
    connectionString,
    ssl: {
      rejectUnauthorized: false
    },
    // Important for serverless: limit connections
    max: process.env.VERCEL === '1' ? 1 : 10,
    idleTimeoutMillis: 30000,
  })
  
  const adapter = new PrismaPg(pool)
  
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}