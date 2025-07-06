import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import { createPin } from "@/lib/database"

export const dynamic = "force-dynamic"

function generateRandomPin(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = "PIN"
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const { count } = await request.json()

    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "Invalid count. Must be between 1 and 100" }, { status: 400 })
    }

    const pins = []
    for (let i = 0; i < count; i++) {
      const pinCode = generateRandomPin()
      const pin = await createPin(pinCode, user.userId)
      pins.push(pin)
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${count} PINs successfully`,
      pins: pins.map((p) => ({ id: p.id, pinCode: p.pinCode, status: p.status })),
    })
  } catch (error) {
    console.error("PIN generation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
