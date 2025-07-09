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
    let email: string | null = null
    let name: string | null = null
    let phone: string | null = null
    let status: string | null = null
    let activationDate: any = null

    const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId.toUpperCase())))
    if (!userSnap.empty) {
      const userDoc = userSnap.docs[0].data()
      memberId = userDoc.userId || null
      collectionId = userDoc.collectionId || null
      email = userDoc.email || null
      name = userDoc.name || null
      phone = userDoc.phone || null
      status = userDoc.status || null
      activationDate = userDoc.activationDate || null
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

    // Get withdrawals for this user
    const withdrawalsSnap = await getDocs(query(
      collection(db, "withdrawals"),
      where("userId", "==", userId.toUpperCase())
    ))
    const withdrawals = withdrawalsSnap.docs.map(doc => doc.data())

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

    return NextResponse.json({
      memberId,
      collectionId,
      email,
      name,
      phone,
      status,
      activationDate,
      totalEarnings,
      availableBalance,
      pendingEarnings,
      totalReferrals,
      referrals,
      commissions,
      withdrawals,
    })
  } catch (error) {
    console.error("User stats error:", error)
    return NextResponse.json({ error: "Failed to load user stats" }, { status: 500 })
  }
}
