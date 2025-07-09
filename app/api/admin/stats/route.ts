import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    // Make sure "users" and "commissions" collections exist in Firestore

    // Total users
    const usersSnap = await getDocs(collection(db, "users"))
    const totalUsers = usersSnap.size

    // Total earnings (sum of all commissions with status "approved")
    let totalEarnings = 0
    const commissionsSnap = await getDocs(query(collection(db, "commissions"), where("status", "==", "approved")))
    commissionsSnap.forEach(doc => {
      const amount = doc.data().amount || 0
      totalEarnings += amount
    })

    // Pending commissions (sum of all commissions with status "pending")
    let pendingCommissions = 0
    const pendingSnap = await getDocs(query(collection(db, "commissions"), where("status", "==", "pending")))
    pendingSnap.forEach(doc => {
      const amount = doc.data().amount || 0
      pendingCommissions += amount
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalEarnings,
        pendingCommissions,
      }
    })
  } catch (error) {
    // This error is usually caused by:
    // - The "users" or "commissions" collection does not exist in Firestore
    // - Firestore security rules are blocking the read
    // - Firestore is not initialized correctly
    // - The server is missing environment variables for Firebase config

    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to load admin statistics" }, { status: 500 })
  }
}