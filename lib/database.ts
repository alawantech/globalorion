import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./db/schema"

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, { schema })

export async function initializeDatabase() {
  try {
    console.log("🚀 Starting database initialization...")

    // Check if admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || "admin@globalorion.com"
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

    console.log("👤 Checking for admin user...")
    const adminExists = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, adminEmail),
    })

    if (!adminExists) {
      console.log("👤 Creating admin user...")
      const bcrypt = await import("bcryptjs")
      const hashedPassword = await bcrypt.hash(adminPassword, 12)

      await db.insert(schema.users).values({
        memberId: "BO000001",
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
        phone: process.env.ADMIN_PHONE || "+2348000000000",
        passwordHash: hashedPassword,
        status: "active",
        role: "admin",
        activationDate: new Date(),
      })

      console.log("✅ Admin user created successfully!")
    } else {
      console.log("👤 Admin user already exists")
    }

    // Check if system settings exist
    console.log("⚙️ Checking system settings...")
    const settingsExist = await db.query.systemSettings.findFirst()

    if (!settingsExist) {
      console.log("⚙️ Creating system settings...")
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

      console.log("✅ System settings created successfully!")
    } else {
      console.log("⚙️ System settings already exist")
    }

    console.log("🎉 Database initialization completed successfully!")

    return {
      success: true,
      message: "Database initialized successfully",
      adminCredentials: {
        email: adminEmail,
        password: adminPassword,
      },
    }
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    throw error
  }
}

// Export the database instance and schema
export * from "./db/schema"
