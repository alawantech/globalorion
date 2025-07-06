import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { users, systemSettings } from "@/lib/database"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST() {
  try {
    console.log("🔄 Initializing database...")

    // Test database connection
    try {
      await db.select().from(users).limit(1)
      console.log("✅ Database connection successful")
    } catch (connectionError) {
      console.error("❌ Database connection failed:", connectionError)
      return NextResponse.json(
        {
          error: "Database connection failed. Please check your DATABASE_URL environment variable.",
          details: connectionError instanceof Error ? connectionError.message : "Unknown error",
        },
        { status: 503 },
      )
    }

    // Check if admin user exists
    const adminEmail = process.env.ADMIN_EMAIL || "admin@brightorian.com"
    const adminExists = await db.query.users.findFirst({
      where: eq(users.email, adminEmail),
    })

    if (!adminExists) {
      console.log("Creating admin user...")
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "admin123", 12)

      // Create admin user
      await db.insert(users).values({
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

      console.log("✅ Admin user created")
    } else {
      console.log("✅ Admin user already exists")
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
        await db.insert(systemSettings).values(setting)
      }

      console.log("✅ System settings created")
    } else {
      console.log("✅ System settings already exist")
    }

    console.log("✅ Database initialization complete!")

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully",
      adminEmail: adminEmail,
    })
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    return NextResponse.json(
      {
        error: "Database initialization failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

