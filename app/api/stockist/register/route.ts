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
    const {
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      licenseNumber,
      bankName,
      accountNumber,
      accountName,
    } = body

    if (
      !businessName ||
      !businessAddress ||
      !businessPhone ||
      !businessEmail ||
      !bankName ||
      !accountNumber ||
      !accountName
    ) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = getDatabase()

    // Check if user already has a stockist application
    const existingStockist = db.stockists.find((s) => s.userId === decoded.userId)
    if (existingStockist) {
      return NextResponse.json({ error: "You already have a stockist application" }, { status: 400 })
    }

    // Create new stockist application
    const newStockist = {
      id: Date.now(),
      userId: decoded.userId,
      businessName,
      businessAddress,
      businessPhone,
      businessEmail,
      licenseNumber: licenseNumber || "",
      bankName,
      accountNumber,
      accountName,
      status: "pending",
      totalSales: 0,
      totalCommission: 0,
      availableStock: 0,
      createdAt: new Date().toISOString(),
    }

    db.stockists.push(newStockist)

    return NextResponse.json({
      message: "Stockist application submitted successfully",
      stockist: newStockist,
    })
  } catch (error) {
    console.error("Stockist registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
