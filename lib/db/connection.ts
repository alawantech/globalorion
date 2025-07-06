import Database from "better-sqlite3"
import { drizzle } from "drizzle-orm/better-sqlite3"
import * as schema from "./schema"
import path from "path"

// Only create database connection on server side
let db: ReturnType<typeof drizzle> | null = null

export function getDatabase() {
  if (typeof window !== "undefined") {
    throw new Error("Database should only be accessed on server side")
  }

  if (!db) {
    const dbPath = path.join(process.cwd(), "bright-orion.db")
    const sqlite = new Database(dbPath)

    // Enable foreign keys
    sqlite.pragma("foreign_keys = ON")

    db = drizzle(sqlite, { schema })
    console.log("✅ Database connected successfully!")
  }

  return db
}

// Test database connection
export async function testConnection() {
  try {
    const database = getDatabase()
    const result = database.select().from(schema.users).limit(1).all()
    console.log("✅ Database test successful")
    return true
  } catch (error) {
    console.error("❌ Database test failed:", error)
    return false
  }
}

// Initialize database with required data
export async function initializeDatabase() {
  try {
    console.log("🔄 Initializing database...")
    const database = getDatabase()

    // Check if admin user exists
    const adminExists = database.select().from(schema.users).where(schema.users.email.eq("admin@brightorian.com")).get()

    if (!adminExists) {
      console.log("Creating admin user...")
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash("admin123", 10)

      // Create admin user
      database
        .insert(schema.users)
        .values({
          memberId: "BO000001",
          firstName: "Admin",
          lastName: "User",
          email: "admin@brightorian.com",
          phone: "+2348000000000",
          passwordHash: hashedPassword,
          status: "active",
          role: "admin",
          activationDate: new Date(),
        })
        .run()

      console.log("✅ Admin user created")
    }

    // Check if system settings exist
    const settingsExist = database.select().from(schema.systemSettings).limit(1).get()

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
        database.insert(schema.systemSettings).values(setting).run()
      }

      console.log("✅ System settings created")
    }

    console.log("✅ Database initialization complete!")
    return true
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return false
  }
}
