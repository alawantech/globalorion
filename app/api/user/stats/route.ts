import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params (?userId=...)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Get user document by userId (case-insensitive)
    let collectionId: string | null = null
    let memberId: string | null = null
    const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId.toUpperCase())))
    if (!userSnap.empty) {
      const userDoc = userSnap.docs[0].data()
      memberId = userDoc.userId || null
      // Only include collectionId if it exists for this user
      if (userDoc.collectionId) {
        collectionId = userDoc.collectionId
      }
    }

    // Get referrals where sponsorId == userId (case-insensitive)
    const referralsSnap = await getDocs(query(
      collection(db, "referrals"),
      where("sponsorId", "==", userId.toUpperCase())
    ))
    const referrals = referralsSnap.docs.map(doc => doc.data())

    // Get commissions where userId == userId (case-insensitive)
    const commissionsSnap = await getDocs(query(
      collection(db, "commissions"),
      where("userId", "==", userId.toUpperCase())
    ))
    const commissions = commissionsSnap.docs.map(doc => doc.data())

    // Calculate total earnings (approved commissions)
    const totalEarnings = commissions
      .filter(c => (c.status || "").toLowerCase() === "approved")
      .reduce((sum, c) => sum + (c.amount || 0), 0)

    // Calculate available balance (approved and not withdrawn)
    const availableBalance = totalEarnings // Adjust if you track withdrawals

    // Calculate pending earnings
    const pendingEarnings = commissions
      .filter(c => (c.status || "").toLowerCase() === "pending")
      .reduce((sum, c) => sum + (c.amount || 0), 0)

    // Total referrals (direct)
    const totalReferrals = referrals.length

    // Return all stats for frontend dashboard
    return NextResponse.json({
      memberId,
      ...(collectionId ? { collectionId } : {}),
      totalEarnings,
      availableBalance,
      pendingEarnings,
      totalReferrals,
      referrals,
      commissions,
    })
  } catch (error) {
    console.error("User stats error:", error)
    return NextResponse.json({ error: "Failed to load user stats" }, { status: 500 })
  }
}
    return NextResponse.json({ error: "Failed to load user stats" }, { status: 500 })
  }
}
