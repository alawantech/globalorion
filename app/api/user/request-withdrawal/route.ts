import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"

export async function POST(req: NextRequest) {
  try {
    const { userId, amount } = await req.json()
    if (!userId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 })
    }

    // Try to find user by userId field (not doc ID)
    let userDocRef = doc(db, "users", userId)
    let userSnap = await getDoc(userDocRef)

    // If not found, search for user where userId field matches (for custom userId)
    if (!userSnap.exists()) {
      // Query by userId field
      const { getDocs, collection, query, where } = await import("firebase/firestore")
      const q = query(collection(db, "users"), where("userId", "==", userId))
      const snap = await getDocs(q)
      if (!snap.empty) {
        userDocRef = snap.docs[0].ref
        userSnap = snap.docs[0]
      }
    }

    if (!userSnap.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const userData = userSnap.data()
    const prevRequested = typeof userData.requestedWithdrawals === "number" ? userData.requestedWithdrawals : 0

    // Update requestedWithdrawals in user doc
    await updateDoc(userDocRef, {
      requestedWithdrawals: prevRequested + amount
    })

    // Optionally, you can also log the withdrawal request in a separate collection here

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 })
  }
}
