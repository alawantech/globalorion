import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const db = getDatabase()
    const stockist = db.stockists.find((s) => s.userId === decoded.userId)

    if (!stockist) {
      return NextResponse.json({ error: "Stockist not found" }, { status: 404 })
    }

    return NextResponse.json({ stockist })
  } catch (error) {
    console.error("Get stockist profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
