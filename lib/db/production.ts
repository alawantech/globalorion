import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Production database connection
const connectionString = process.env.DATABASE_URL!

const client = postgres(connectionString, {
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
})

export const db = drizzle(client, { schema })

// Initialize production database
export async function initializeProductionDatabase() {
  try {
    // Check if admin user exists
    const adminExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, process.env.ADMIN_EMAIL || "admin@brightorian.com"),
    })

    if (!adminExists) {
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12)

      // Create admin user
      await db.insert(schema.users).values({
        memberId: "BO000001",
        firstName: "Admin",
        lastName: "User",
        email: process.env.ADMIN_EMAIL || "admin@brightorian.com",
        phone: process.env.ADMIN_PHONE || "+2348000000000",
        passwordHash: hashedPassword,
        status: "active",
        role: "admin",
        activationDate: new Date(),
      })

      console.log("Production database initialized")
    }
  } catch (error) {
    console.error("Production database initialization error:", error)
  }
}
