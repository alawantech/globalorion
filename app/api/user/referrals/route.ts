import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, orderBy } from "firebase/firestore"
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

    // Get referrals from the referrals collection where this user is the sponsor
    try {
      const referralsQuery = query(
        collection(db, "referrals"), 
        where("sponsorId", "==", userId),
        orderBy("joinedAt", "desc")
      )
      
      const referralsSnapshot = await getDocs(referralsQuery)
      const referrals = referralsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format the joinedAt timestamp for display
        joinedAt: doc.data().joinedAt?.toDate?.()?.toLocaleDateString() || 'Unknown'
      }))

      console.log(`✅ Found ${referrals.length} referrals for user ${userId}`)

      return NextResponse.json({
        success: true,
        referrals: referrals
      })
    } catch (referralError: any) {
      console.error("❌ Error fetching referrals:", referralError)
      // Return empty array if there's an error (collection might not exist)
      return NextResponse.json({
        success: true,
        referrals: []
      })
    }
  } catch (error: any) {
    console.error("❌ Referrals error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
