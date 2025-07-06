import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { users, activationPins } from "@/lib/database"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 User registration started...")

    const body = await request.json()
    const { fullName, email, phone, password, sponsorId, uplineId, pin, location, pinMethod, packagePrice } = body

    // Split fullName into firstName and lastName
    const nameParts = fullName.trim().split(" ")
    const firstName = nameParts[0] || ""
    const lastName = nameParts.slice(1).join(" ") || ""

    // Validate required fields
    if (!firstName || !email || !phone || !password || !sponsorId || !uplineId) {
      return NextResponse.json({ error: "All required fields must be filled" }, { status: 400 })
    }

    // Check if email already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email.toLowerCase()),
    })

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 })
    }

    // Validate sponsor exists
    const sponsor = await db.query.users.findFirst({
      where: eq(users.memberId, sponsorId.toUpperCase()),
    })

    if (!sponsor) {
      return NextResponse.json({ error: "Invalid sponsor ID" }, { status: 400 })
    }

    // Validate upline exists
    const upline = await db.query.users.findFirst({
      where: eq(users.memberId, uplineId.toUpperCase()),
    })

    if (!upline) {
      return NextResponse.json({ error: "Invalid upline ID" }, { status: 400 })
    }

    // Validate PIN if using existing PIN method
    if (pinMethod === "existing") {
      if (!pin) {
        return NextResponse.json({ error: "Registration PIN is required" }, { status: 400 })
      }

      const validPin = await db.query.activationPins.findFirst({
        where: eq(activationPins.pin, pin),
      })

      if (!validPin || validPin.status !== "unused") {
        return NextResponse.json({ error: "Invalid or already used PIN" }, { status: 400 })
      }
    }

    // Generate member ID
    const userCount = await db.select().from(users)
    const memberNumber = (userCount.length + 1).toString().padStart(6, "0")
    const memberId = `BO${memberNumber}`

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user based on PIN method
    let newUser
    if (pinMethod === "existing") {
      // User has PIN - activate immediately
      newUser = await db
        .insert(users)
        .values({
          memberId,
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          passwordHash,
          sponsorId: sponsor.id,
          uplineId: upline.id,
          location: location || null,
          status: "active",
          role: "user",
          activationDate: new Date(),
        })
        .returning()

      // Mark PIN as used
      await db
        .update(activationPins)
        .set({ status: "used", usedBy: newUser[0].id, usedAt: new Date() })
        .where(eq(activationPins.pin, pin))

      console.log("✅ User registered and activated with PIN:", newUser[0].email)

      return NextResponse.json({
        success: true,
        message: "Registration successful! You can now login.",
        user: {
          id: newUser[0].id,
          memberId: newUser[0].memberId,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          email: newUser[0].email,
          phone: newUser[0].phone,
          status: newUser[0].status,
          pinMethod,
        },
      })
    } else {
      // User needs to buy package - create pending account
      newUser = await db
        .insert(users)
        .values({
          memberId,
          firstName,
          lastName,
          email: email.toLowerCase(),
          phone,
          passwordHash,
          sponsorId: sponsor.id,
          uplineId: upline.id,
          location: location || null,
          status: "pending",
          role: "user",
          activationDate: null,
        })
        .returning()

      console.log("✅ User registered (pending payment):", newUser[0].email)

      return NextResponse.json({
        success: true,
        message: "Registration successful! Please proceed to payment to receive your PIN.",
        user: {
          id: newUser[0].id,
          memberId: newUser[0].memberId,
          firstName: newUser[0].firstName,
          lastName: newUser[0].lastName,
          email: newUser[0].email,
          phone: newUser[0].phone,
          status: newUser[0].status,
          packagePrice: packagePrice || 36000,
          pinMethod,
          fullName,
        },
      })
    }
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
