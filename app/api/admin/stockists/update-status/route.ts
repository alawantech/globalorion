import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { stockistId, status } = body

    if (!stockistId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["approved", "rejected", "suspended"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const db = getDatabase()
    const stockist = db.stockists.find((s) => s.id === stockistId)

    if (!stockist) {
      return NextResponse.json({ error: "Stockist not found" }, { status: 404 })
    }

    stockist.status = status

    return NextResponse.json({
      message: `Stockist ${status} successfully`,
      stockist,
    })
  } catch (error) {
    console.error("Update stockist status error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
