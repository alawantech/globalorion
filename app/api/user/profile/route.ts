import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    console.log("👤 Profile request started...")

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Get user info from the token payload
    let userUid: string
    let userEmail: string
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      userUid = payload.uid || payload.user_id
      userEmail = payload.email
      console.log("🔍 Token info - UID:", userUid, "Email:", userEmail)
    } catch (error) {
      console.error("❌ Token decode error:", error)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("✅ Token verified for user:", userEmail)

    // Find user by email in the users collection
    let userDoc
    let userData
    
    try {
      console.log("🔍 Searching for user by email:", userEmail)
      
      const emailQuery = query(collection(db, "users"), where("email", "==", userEmail))
      const emailSnapshot = await getDocs(emailQuery)
      
      if (!emailSnapshot.empty) {
        userDoc = emailSnapshot.docs[0]
        userData = userDoc.data()
        console.log("✅ Found user by email - Document ID:", userDoc.id)
        console.log("✅ User data:", { name: userData.name, userId: userData.userId, email: userData.email })
      } else {
        console.error("❌ No user found with email:", userEmail)
        return NextResponse.json({ error: "User not found with this email" }, { status: 404 })
      }
    } catch (searchError: any) {
      console.error("❌ Error searching for user:", searchError)
      return NextResponse.json({ error: "Database search error", details: searchError.message }, { status: 500 })
    }

    // Get commissions for this user to calculate earnings
    let totalEarnings = 0
    let pendingEarnings = 0
    
    try {
      const commissionsQuery = query(collection(db, "commissions"), where("userId", "==", userData.userId))
      const commissionsSnapshot = await getDocs(commissionsQuery)
      
      commissionsSnapshot.docs.forEach(doc => {
        const commission = doc.data()
        if (commission.status === "approved") {
          totalEarnings += commission.amount || 0
        } else if (commission.status === "pending") {
          pendingEarnings += commission.amount || 0
        }
      })
      
      console.log("💰 Calculated earnings - Total:", totalEarnings, "Pending:", pendingEarnings)
    } catch (error) {
      console.error("❌ Error calculating earnings:", error)
    }

    // Get referrals count
    let referralsCount = 0
    try {
      const referralsQuery = query(collection(db, "referrals"), where("sponsorId", "==", userData.userId))
      const referralsSnapshot = await getDocs(referralsQuery)
      referralsCount = referralsSnapshot.docs.length
      console.log("👥 Found referrals count:", referralsCount)
    } catch (error) {
      console.error("❌ Error getting referrals count:", error)
    }

    return NextResponse.json({
      success: true,
      user: {
        uid: userUid, // Firebase Auth UID
        documentId: userDoc.id, // Firestore document ID
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        collectionId: userData.collectionId || null, // <-- fetch collectionId if present
        status: userData.status,
        role: userData.role,
        currentLevel: userData.currentLevel,
        createdAt: userData.createdAt,
        activationDate: userData.activationDate,
        location: userData.location,
        sponsorId: userData.sponsorId,
        uplineId: userData.uplineId,
      },
      stats: {
        totalEarnings: totalEarnings,
        pendingEarnings: pendingEarnings,
        availableBalance: totalEarnings, // Available balance = approved earnings
        referralsCount: referralsCount,
      },
    })
  } catch (error: any) {
    console.error("❌ Profile error:", error)
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 })
  }
}
