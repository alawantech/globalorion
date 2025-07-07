import { NextResponse } from "next/server"
import { collection, getDocs, query, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    console.log("🔗 Testing Firebase connection...")
    
    // Test basic connection
    const testQuery = query(collection(db, "users"), limit(1))
    const snapshot = await getDocs(testQuery)
    
    console.log(`✅ Firebase connection successful! Found ${snapshot.docs.length} documents in users collection`)
    
    // Get all users for debugging
    const allUsersQuery = query(collection(db, "users"))
    const allUsersSnapshot = await getDocs(allUsersQuery)
    
    const users = allUsersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
    
    return NextResponse.json({
      success: true,
      message: "Firebase connection successful",
      totalUsers: users.length,
      users: users,
      projectId: "global-orion",
      connectionStatus: "Connected"
    })
    
  } catch (error: any) {
    console.error("❌ Firebase connection failed:", error)
    
    return NextResponse.json({
      success: false,
      error: error.message,
      projectId: "global-orion",
      connectionStatus: "Failed"
    }, { status: 500 })
  }
}
