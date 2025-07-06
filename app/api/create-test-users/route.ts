import { NextResponse } from "next/server"
import { db } from "@/lib/database"
import { users, activationPins } from "@/lib/database"
import bcrypt from "bcryptjs"

export async function POST() {
  try {
    console.log("🧪 Creating test users...")

    // Create activation PINs first
    const testPins = ["TEST001", "TEST002", "TEST003"]

    for (const pin of testPins) {
      const existingPin = await db.query.activationPins.findFirst({
        where: (pins, { eq }) => eq(pins.pin, pin),
      })

      if (!existingPin) {
        await db.insert(activationPins).values({
          pin,
          generatedBy: 1, // Admin user ID
          status: "unused",
        })
      }
    }

    // Create test users
    const testUsers = [
      {
        memberId: "BO000002",
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        phone: "+2348123456789",
        password: "test123",
        pin: "TEST001",
      },
      {
        memberId: "BO000003",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@test.com",
        phone: "+2348123456790",
        password: "test123",
        pin: "TEST002",
      },
      {
        memberId: "BO000004",
        firstName: "Mike",
        lastName: "Johnson",
        email: "mike@test.com",
        phone: "+2348123456791",
        password: "test123",
        pin: "TEST003",
      },
    ]

    const createdUsers = []

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, userData.email),
      })

      if (!existingUser) {
        const passwordHash = await bcrypt.hash(userData.password, 12)

        const newUser = await db
          .insert(users)
          .values({
            memberId: userData.memberId,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            passwordHash,
            status: "active",
            role: "user",
            activationDate: new Date(),
            totalEarnings: Math.floor(Math.random() * 50000), // Random earnings for demo
            availableBalance: Math.floor(Math.random() * 25000), // Random balance for demo
            totalReferrals: Math.floor(Math.random() * 10), // Random referrals for demo
          })
          .returning()

        // Mark PIN as used
        const pin = await db.query.activationPins.findFirst({
          where: (pins, { eq, and }) => and(eq(pins.pin, userData.pin), eq(pins.status, "unused")),
        })

        if (pin) {
          await db
            .update(activationPins)
            .set({ status: "used", usedBy: newUser[0].id, usedAt: new Date() })
            .where((pins, { eq }) => eq(pins.id, pin.id))
        }

        createdUsers.push({
          ...newUser[0],
          password: userData.password, // Include password for testing
        })

        console.log(`✅ Created test user: ${userData.email}`)
      } else {
        console.log(`👤 Test user already exists: ${userData.email}`)
        createdUsers.push({
          ...existingUser,
          password: userData.password, // Include password for testing
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Test users created successfully!",
      users: createdUsers.map((user) => ({
        email: user.email,
        password: user.password,
        memberId: user.memberId,
        name: `${user.firstName} ${user.lastName}`,
      })),
    })
  } catch (error) {
    console.error("❌ Error creating test users:", error)
    return NextResponse.json({ error: "Failed to create test users" }, { status: 500 })
  }
}
