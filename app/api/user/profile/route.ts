import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { users, commissions } from "@/lib/db/schema"
import { eq, and, sum } from "drizzle-orm"
import { verifyTokenFromRequest } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    console.log("👤 Profile request started...")

    const user = await verifyTokenFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("✅ Token verified for user:", user.userId)

    // Get user profile
    const userProfile = await db.query.users.findFirst({
      where: eq(users.id, user.userId),
    })

    if (!userProfile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get user statistics
    const totalEarnings = await db
      .select({ total: sum(commissions.amount) })
      .from(commissions)
      .where(and(eq(commissions.userId, userProfile.id), eq(commissions.status, "approved")))

    const pendingEarnings = await db
      .select({ total: sum(commissions.amount) })
      .from(commissions)
      .where(and(eq(commissions.userId, userProfile.id), eq(commissions.status, "pending")))

    // Get referrals count
    const referralsCount = await db.select().from(users).where(eq(users.sponsorId, userProfile.id))

    console.log("✅ Profile data retrieved for user:", userProfile.email)

    return NextResponse.json({
      success: true,
      user: {
        id: userProfile.id,
        memberId: userProfile.memberId,
        firstName: userProfile.firstName,
        lastName: userProfile.lastName,
        email: userProfile.email,
        phone: userProfile.phone,
        status: userProfile.status,
        role: userProfile.role,
        activationDate: userProfile.activationDate,
      },
      stats: {
        totalEarnings: totalEarnings[0]?.total || 0,
        pendingEarnings: pendingEarnings[0]?.total || 0,
        availableBalance: (totalEarnings[0]?.total || 0) - 0, // minus withdrawals
        referralsCount: referralsCount.length,
      },
    })
  } catch (error) {
    console.error("❌ Profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
