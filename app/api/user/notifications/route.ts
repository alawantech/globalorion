import { NextRequest, NextResponse } from "next/server"
import { collection, query, where, getDocs, orderBy, limit, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    console.log("🔔 Notifications request started...")

    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let userUid: string
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      userUid = payload.uid || payload.user_id
    } catch (error) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get the user's userId from their document
    const userDoc = await getDoc(doc(db, "users", userUid))
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userDoc.data()
    const userId = userData.userId

    // Get notifications from the notifications collection
    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(10)
    )
    
    const notificationsSnapshot = await getDocs(notificationsQuery)
    const notifications = notificationsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))

    console.log(`✅ Found ${notifications.length} notifications for user ${userId}`)

    return NextResponse.json({
      success: true,
      notifications
    })
  } catch (error) {
    console.error("❌ Notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
