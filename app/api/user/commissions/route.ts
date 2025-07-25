import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    console.log("💰 Commissions request started...")

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

    console.log("🔍 Getting commissions for user:", userId)

    try {
      // Find user doc by userId
      const userDocQuery = query(collection(db, "users"), where("userId", "==", userId))
      const userDocSnapshot = await getDocs(userDocQuery)
      
      if (userDocSnapshot.empty) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      
      const userDocData = userDocSnapshot.docs[0].data()
      // Get commissions from user doc array
      const commissions = Array.isArray(userDocData.commissions) ? userDocData.commissions : []

      console.log(`✅ Found ${commissions.length} commissions for user ${userId}`)

      return NextResponse.json({
        success: true,
        commissions: commissions
      })
    } catch (commissionError: any) {
      console.error("❌ Error fetching commissions:", commissionError)
      // Return empty array if there's an error
      return NextResponse.json({
        success: true,
        commissions: []
      })
    }
  } catch (error: any) {
    console.error("❌ Commissions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
    
