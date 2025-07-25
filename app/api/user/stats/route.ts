import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"

// GET /api/user/stats?userId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Try to find user by userId field
    let userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
    let userDoc, userData

    if (!userSnap.empty) {
      userDoc = userSnap.docs[0]
      userData = userDoc.data()
    } else {
      // Try to find user by document ID (Firebase Auth UID)
      const docRef = doc(db, "users", userId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        userDoc = docSnap
        userData = docSnap.data()
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    // Fetch referrals, downlines, commissions from user doc arrays
    const referrals = Array.isArray(userData.referrals) ? userData.referrals : []
    const downlines = Array.isArray(userData.downlines) ? userData.downlines : []
    const commissions = Array.isArray(userData.commissions) ? userData.commissions : []

    // Fetch requested withdrawals for this user
    let requestedWithdrawals = typeof userData.requestedWithdrawals === "number" ? userData.requestedWithdrawals : 0

    // Compose full user stats
    return NextResponse.json({
      ...userData,
      referrals,
      downlines,
      commissions,
      requestedWithdrawals
    })
  } catch (error) {
    console.error("User stats API error:", error)
    return NextResponse.json({ error: "Failed to load user stats" }, { status: 500 })
  }
}