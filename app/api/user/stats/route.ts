import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    // Get userId from query params (?userId=...)
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Try to fetch user doc by userId (case-insensitive, and as doc id fallback)
    let userDocData: any = null

    // 1. Try by userId field (exact)
    let userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
    // 2. Try by userId field (uppercase)
    if (userSnap.empty) {
      userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId.toUpperCase())))
    }
    // 3. Try by Firestore doc id (in case userId is actually the doc id)
    if (userSnap.empty) {
      const docRef = doc(db, "users", userId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        userDocData = docSnap.data()
      }
    } else {
      userDocData = userSnap.docs[0].data()
    }

    // Debug: log collectionId to server console
    console.log("User stats API - collectionId:", userDocData?.collectionId)

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
      memberId: userDocData?.userId || null,
      collectionId: userDocData?.collectionId || null,
      email: userDocData?.email || null,
      name: userDocData?.name || null,
      phone: userDocData?.phone || null,
      status: userDocData?.status || null,
      activationDate: userDocData?.activationDate || null,
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