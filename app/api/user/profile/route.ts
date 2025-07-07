import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc } from "firebase/firestore"
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

    // For now, we'll get the user ID from the token payload (simplified)
    let userUid: string
    try {
      const payload = JSON.parse(atob(token.split(".")[1]))
      userUid = payload.uid || payload.user_id
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    console.log("✅ Token verified for user:", userUid)

    // Get user profile from Firestore
    const userDoc = await getDoc(doc(db, "users", userUid))

    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    console.log("✅ Profile data retrieved for user:", userData.email)

    return NextResponse.json({
      success: true,
      user: {
        uid: userUid,
        userId: userData.userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        status: userData.status,
        role: userData.role,
        currentLevel: userData.currentLevel,
        createdAt: userData.createdAt,
        activationDate: userData.activationDate,
        location: userData.location,
      },
      stats: {
        totalEarnings: userData.totalEarnings || 0,
        pendingEarnings: userData.pendingEarnings || 0,
        availableBalance: userData.totalEarnings || 0,
        referralsCount: userData.downlines?.length || 0,
      },
    })
  } catch (error) {
    console.error("❌ Profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
    console.error("❌ Profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
}
