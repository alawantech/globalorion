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
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { quantity } = body

    if (!quantity || quantity <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 })
    }

    const db = getDatabase()
    const stockist = db.stockists.find((s) => s.userId === decoded.userId)

    if (!stockist) {
      return NextResponse.json({ error: "Stockist not found" }, { status: 404 })
    }

    if (stockist.status !== "approved") {
      return NextResponse.json({ error: "Stockist not approved" }, { status: 400 })
    }

    const wholesalePrice = 30000 // Wholesale price per unit
    const totalAmount = quantity * wholesalePrice

    // For demo purposes, we'll automatically approve the stock request
    // In production, this would require payment processing
    stockist.availableStock += quantity

    // Record transaction
    const transaction = {
      id: Date.now(),
      stockistId: stockist.id,
      type: "purchase",
      quantity,
      unitPrice: wholesalePrice,
      totalAmount,
      commission: 0,
      customerName: "Stock Purchase",
      createdAt: new Date().toISOString(),
    }

    if (!db.stockistTransactions) {
      db.stockistTransactions = []
    }
    db.stockistTransactions.push(transaction)

    return NextResponse.json({
      message: "Stock request processed successfully",
      transaction,
      stockist,
    })
  } catch (error) {
    console.error("Request stock error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
