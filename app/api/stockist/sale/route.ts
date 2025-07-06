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
    const { quantity, customerName, customerPhone, customerEmail, unitPrice } = body

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

    if (stockist.availableStock < quantity) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 })
    }

    const totalAmount = quantity * unitPrice
    const commission = totalAmount * 0.1 // 10% commission

    // Update stockist data
    stockist.availableStock -= quantity
    stockist.totalSales += totalAmount
    stockist.totalCommission += commission

    // Record transaction
    const transaction = {
      id: Date.now(),
      stockistId: stockist.id,
      type: "sale",
      quantity,
      unitPrice,
      totalAmount,
      commission,
      customerName: customerName || "",
      customerPhone: customerPhone || "",
      customerEmail: customerEmail || "",
      createdAt: new Date().toISOString(),
    }

    if (!db.stockistTransactions) {
      db.stockistTransactions = []
    }
    db.stockistTransactions.push(transaction)

    return NextResponse.json({
      message: "Sale recorded successfully",
      transaction,
      stockist,
    })
  } catch (error) {
    console.error("Record sale error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
