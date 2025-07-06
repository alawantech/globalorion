import { drizzle } from "drizzle-orm/better-sqlite3"
import Database from "better-sqlite3"
import * as schema from "./schema"
import path from "path"

// Create database file path
const dbPath = path.join(process.cwd(), "bright-orion.db")

// Initialize SQLite database
const sqlite = new Database(dbPath)

// Enable foreign keys and WAL mode for better performance
sqlite.pragma("foreign_keys = ON")
sqlite.pragma("journal_mode = WAL")

// Create Drizzle instance
export const db = drizzle(sqlite, { schema })

// Test database connection
export function testConnection() {
  try {
    const result = sqlite.prepare("SELECT 1 as test").get()
    console.log("✅ Database connected successfully!")
    return true
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    return false
  }
}

// Initialize database with admin user and settings
export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database...")

    // Test connection first
    if (!testConnection()) {
      throw new Error("Database connection failed")
    }

    // Check if admin user exists
    const adminExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, process.env.ADMIN_EMAIL || "admin@brightorian.com"),
    })

    if (!adminExists) {
      console.log("Creating admin user...")
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

      console.log("✅ Admin user created")
    }

    // Check if system settings exist
    const settingsExist = await db.query.systemSettings.findFirst()

    if (!settingsExist) {
      console.log("Creating system settings...")
      const settings = [
        { settingKey: "package_price", settingValue: "36000" },
        { settingKey: "min_withdrawal", settingValue: "5000" },
        { settingKey: "level_1_commission", settingValue: "4000" },
        { settingKey: "level_2_commission", settingValue: "2000" },
        { settingKey: "level_3_commission", settingValue: "2000" },
        { settingKey: "level_4_commission", settingValue: "1500" },
        { settingKey: "level_5_commission", settingValue: "1500" },
        { settingKey: "level_6_commission", settingValue: "1500" },
        { settingKey: "max_matrix_levels", settingValue: "6" },
        { settingKey: "referrals_per_level", settingValue: "5" },
      ]

      for (const setting of settings) {
        await db.insert(schema.systemSettings).values(setting)
      }

      console.log("✅ System settings created")
    }

    console.log("✅ Database initialization complete!")
    return true
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  }
}

// Export schema for use in other files
export * from "./schema"
