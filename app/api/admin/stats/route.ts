import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenFromRequest } from "@/lib/auth"
import { db } from "@/lib/database"
import { users, activationPins, payments, commissions } from "@/lib/db/schema"
import { eq, count, sum } from "drizzle-orm"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await verifyTokenFromRequest(request)
    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total users
    const totalUsers = await db.select({ count: count() }).from(users)

    // Get active users
    const activeUsers = await db.select({ count: count() }).from(users).where(eq(users.status, "active"))

    // Get pending users
    const pendingUsers = await db.select({ count: count() }).from(users).where(eq(users.status, "pending"))

    // Get total pins
    const totalPins = await db.select({ count: count() }).from(activationPins)

    // Get available pins
    const availablePins = await db
      .select({ count: count() })
      .from(activationPins)
      .where(eq(activationPins.status, "available"))

    // Get used pins
    const usedPins = await db.select({ count: count() }).from(activationPins).where(eq(activationPins.status, "used"))

    // Get total payments
    const totalPayments = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "confirmed"))

    // Get pending payments
    const pendingPayments = await db
      .select({ total: sum(payments.amount) })
      .from(payments)
      .where(eq(payments.status, "pending"))

    // Get total commissions
    const totalCommissions = await db.select({ total: sum(commissions.amount) }).from(commissions)

    // Get pending commissions
    const pendingCommissions = await db
      .select({ total: sum(commissions.amount) })
      .from(commissions)
      .where(eq(commissions.status, "pending"))

    return NextResponse.json({
      users: {
        total: totalUsers[0]?.count || 0,
        active: activeUsers[0]?.count || 0,
        pending: pendingUsers[0]?.count || 0,
      },
      pins: {
        total: totalPins[0]?.count || 0,
        available: availablePins[0]?.count || 0,
        used: usedPins[0]?.count || 0,
      },
      payments: {
        total: totalPayments[0]?.total || 0,
        pending: pendingPayments[0]?.total || 0,
      },
      commissions: {
        total: totalCommissions[0]?.total || 0,
        pending: pendingCommissions[0]?.total || 0,
      },
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
