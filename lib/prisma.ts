import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set")
}

// Parse and normalize connection string
let connectionString = process.env.DATABASE_URL

// Debug: Log the connection string (hide password)
const maskedUrl = connectionString.replace(/:[^:@]+@/, ":****@")
console.log("🔌 Using DATABASE_URL:", maskedUrl)
console.log("🔌 Environment:", process.env.NODE_ENV || "development")

// Fix double question marks (should use & for additional params)
if (connectionString.includes("??")) {
  connectionString = connectionString.replace("??", "?")
}
if (connectionString.match(/\?[^&]*\?/)) {
  connectionString = connectionString.replace(/\?([^&]*)\?/, "?$1&")
}

// Ensure SSL mode is set
// For Supabase pooler, use libpq compat mode to avoid warnings
// For direct connections, 'verify-full' is more secure
if (!connectionString.includes("sslmode=")) {
  connectionString += connectionString.includes("?") ? "&" : "?"
  // Default to require with libpq compat for pooler connections
  if (connectionString.includes("pooler.supabase.com") || connectionString.includes("pgbouncer=true")) {
    if (!connectionString.includes("uselibpqcompat=")) {
      connectionString += "uselibpqcompat=true&"
    }
    connectionString += "sslmode=require"
  } else {
    connectionString += "sslmode=verify-full"
  }
} else if ((connectionString.includes("pooler.supabase.com") || connectionString.includes("pgbouncer=true")) && !connectionString.includes("uselibpqcompat=")) {
  // Add libpq compat flag if using pooler but not already set
  connectionString = connectionString.replace("sslmode=", "uselibpqcompat=true&sslmode=")
}

// Debug: Show what connection string will be used
const finalMaskedUrl = connectionString.replace(/:[^:@]+@/, ":****@")
console.log("🔌 Final connection string:", finalMaskedUrl)
console.log("🔌 Host:", connectionString.match(/@([^:/]+)/)?.[1] || "unknown")
console.log("🔌 Has pgbouncer:", connectionString.includes("pgbouncer=true"))
console.log("🔌 Has SSL:", connectionString.includes("sslmode="))

let adapter: PrismaPg
try {
  adapter = new PrismaPg({
    connectionString: connectionString,
  })
} catch (error) {
  console.error("❌ Failed to create Prisma adapter:", error)
  throw error
}

// Clear cached Prisma client if DATABASE_URL changed (for development)
if (process.env.NODE_ENV !== "production" && globalForPrisma.prisma) {
  // Force recreate if connection string changed
  const cachedUrl = (globalForPrisma.prisma as any).__internal?.connectionString
  if (cachedUrl && cachedUrl !== connectionString) {
    console.log("🔄 DATABASE_URL changed, clearing cached Prisma client")
    delete globalForPrisma.prisma
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma