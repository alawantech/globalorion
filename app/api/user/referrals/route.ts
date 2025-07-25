import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    console.log("👥 Referrals request started...")

    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userEmail: string
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userEmail = payload.email
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Find user by email to get their userId
    const usersQuery = query(collection(db, "users"), where("email", "==", userEmail))
    const usersSnapshot = await getDocs(usersQuery)
    
    if (usersSnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = usersSnapshot.docs[0].data()
    const userId = userData.userId

    console.log("🔍 Getting referrals for user:", userId)

    // Find user doc by userId
    const userReferralsQuery = query(collection(db, "users"), where("userId", "==", userId))
    const userReferralsSnapshot = await getDocs(userReferralsQuery)
    if (userReferralsSnapshot.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const userReferralsData = userReferralsSnapshot.docs[0].data()
    // Get referrals from user doc array
    const referrals = Array.isArray(userReferralsData.referrals) ? userReferralsData.referrals : []

    return NextResponse.json({
      success: true,
      referrals
    })
  } catch (error: any) {
    console.error("❌ Referrals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
