import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"

// GET /api/user/stats?userId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    // Try to find user by userId field
    let userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
    let userDoc, userData

    if (!userSnap.empty) {
      userDoc = userSnap.docs[0]
      userData = userDoc.data()
    } else {
      // Try to find user by document ID (Firebase Auth UID)
      const docRef = doc(db, "users", userId)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        userDoc = docSnap
        userData = docSnap.data()
      } else {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
    }

    // Fetch referrals (users referred by this user)
    const referralsQuery = query(collection(db, "referrals"), where("sponsorId", "==", userId))
    const referralsSnap = await getDocs(referralsQuery)
    const referrals = referralsSnap.docs.map(doc => doc.data())

    // Fetch downlines (users under this user in the matrix)
    let downlines: any[] = []
    if (Array.isArray(userData.downlines)) {
      const downlineIds = userData.downlines
      if (downlineIds.length > 0) {
        const downlineQuery = query(collection(db, "users"), where("userId", "in", downlineIds.slice(0, 10)))
        const downlineSnap = await getDocs(downlineQuery)
        downlines = downlineSnap.docs.map(doc => doc.data())
      }
    } else {
      const downlineQuery = query(collection(db, "users"), where("uplineId", "==", userId))
      const downlineSnap = await getDocs(downlineQuery)
      downlines = downlineSnap.docs.map(doc => doc.data())
    }

    // Fetch commissions for this user
    const commissionsQuery = query(collection(db, "commissions"), where("userId", "==", userId))
    const commissionsSnap = await getDocs(commissionsQuery)
    const commissions = commissionsSnap.docs.map(doc => doc.data())

    // Compose full user stats
    return NextResponse.json({
      ...userData,
      referrals,
      downlines,
      commissions,
    })
  } catch (error) {
    console.error("User stats API error:", error)
    return NextResponse.json({ error: "Failed to load user stats" }, { status: 500 })
  }
}