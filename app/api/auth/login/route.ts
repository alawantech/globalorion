import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { users } from "@/lib/database"
import { eq } from "drizzle-orm"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

// Force dynamic rendering for this route
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login attempt started...")

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("👤 Looking for user:", email)

    // Test database connection first
    try {
      // Find user by email
      const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
      })

      if (!user) {
        console.log("❌ User not found:", email)
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      console.log("✅ User found:", user.email)

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)

      if (!isValidPassword) {
        console.log("❌ Invalid password for user:", email)
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      console.log("✅ Password verified for user:", email)

      // Generate JWT token using jose
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key")

      const token = await new SignJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("7d")
        .sign(secret)

      console.log("✅ JWT token generated for user:", email)

      // Create response
      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          memberId: user.memberId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      })

      // Set HTTP-only cookie
      response.cookies.set("auth-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      console.log("🎉 Login successful for user:", email)
      return response
    } catch (dbError) {
      console.error("❌ Database connection error:", dbError)

      // Check if it's a connection error
      if (dbError instanceof Error && dbError.message.includes("ENOTFOUND")) {
        return NextResponse.json(
          {
            error: "Database connection failed. Please check your database configuration.",
          },
          { status: 503 },
        )
      }

      throw dbError
    }
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error. Please try again later.",
      },
      { status: 500 },
    )
  }
}
