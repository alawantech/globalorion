import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import { getDatabase } from "@/lib/database"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const db = getDatabase()
    const stockist = db.stockists.find((s) => s.userId === user.userId)

    if (!stockist) {
      return NextResponse.json({ error: "Stockist not found" }, { status: 404 })
    }

    const transactions = (db.stockistTransactions || [])
      .filter((t) => t.stockistId === stockist.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
