import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔔 Notifications request started...")

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

    console.log("🔍 Getting notifications for user:", userId)

    try {
      // Get notifications from the notifications collection
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(20) // Get latest 20 notifications
      )
      
      const notificationsSnapshot = await getDocs(notificationsQuery)
      const notifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Format the createdAt timestamp for display
        createdAt: doc.data().createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'
      }))

      console.log(`✅ Found ${notifications.length} notifications for user ${userId}`)

      return NextResponse.json({
        success: true,
        notifications: notifications
      })
    } catch (notificationError: any) {
      console.error("❌ Error fetching notifications:", notificationError)
      // Return empty array if there's an error
      return NextResponse.json({
        success: true,
        notifications: []
      })
    }
  } catch (error: any) {
    console.error("❌ Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
