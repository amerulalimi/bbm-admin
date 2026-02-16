import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // Test database connection with a simple query
    const startTime = Date.now()
    await prisma.$queryRaw`SELECT 1`
    const responseTime = Date.now() - startTime

    // Get connection info
    const connectionString = process.env.DATABASE_URL || ""
    const maskedUrl = connectionString.replace(/:[^:@]+@/, ":****@")
    const host = connectionString.match(/@([^:/]+)/)?.[1] || "unknown"
    const isPooler = connectionString.includes("pooler.supabase.com") || connectionString.includes("pgbouncer=true")
    const hasSSL = connectionString.includes("sslmode=")

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      details: {
        responseTime: `${responseTime}ms`,
        host,
        isPooler,
        hasSSL,
        connectionString: maskedUrl,
        environment: process.env.NODE_ENV || "development",
      },
    })
  } catch (error: any) {
    // Extract detailed error information
    const errorMessage = error?.message || "Unknown error"
    const errorCode = error?.code || "UNKNOWN"
    
    // Check for specific error types
    let errorType = "Connection Error"
    let suggestions: string[] = []

    if (errorMessage.includes("Can't reach database server")) {
      errorType = "Network Error"
      suggestions = [
        "Check if DATABASE_URL is set correctly in environment variables",
        "Verify the database host is accessible",
        "Check firewall/network settings",
        "Ensure you're using the connection pooler URL (port 6543) for Vercel",
      ]
    } else if (errorMessage.includes("self-signed certificate") || errorMessage.includes("certificate")) {
      errorType = "SSL Certificate Error"
      suggestions = [
        "Add 'uselibpqcompat=true&sslmode=require' to your DATABASE_URL",
        "Check SSL configuration in connection string",
      ]
    } else if (errorMessage.includes("authentication failed") || errorMessage.includes("password")) {
      errorType = "Authentication Error"
      suggestions = [
        "Verify database password is correct",
        "Check if password is URL-encoded (%40 for @)",
        "Ensure DATABASE_URL format is correct",
      ]
    } else if (errorMessage.includes("DATABASE_URL")) {
      errorType = "Configuration Error"
      suggestions = [
        "DATABASE_URL environment variable is missing or invalid",
        "Check Vercel environment variables settings",
        "Verify connection string format",
      ]
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
        errorType,
        errorCode,
        suggestions,
        details: {
          environment: process.env.NODE_ENV || "development",
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          connectionString: process.env.DATABASE_URL
            ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")
            : "Not set",
        },
      },
      { status: 500 }
    )
  }
}
