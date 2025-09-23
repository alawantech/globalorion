import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, updateDoc, doc, Timestamp, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    const snap = await getDocs(collection(db, "withdrawals"))
    const withdrawals: any[] = []
    for (const d of snap.docs) {
      const w = d.data()
      // Fetch user info for each withdrawal
      let email = ""
      let name = ""
      if (w.userId) {
        const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", w.userId)))
        if (!userSnap.empty) {
          const user = userSnap.docs[0].data()
          email = user.email || ""
          name = user.name || ""
        }
      }
      withdrawals.push({
        id: d.id,
        ...w,
        email,
        name,
        requestedAt: w.requestedAt?.toDate ? w.requestedAt.toDate() : w.requestedAt
      })
    }
    return NextResponse.json({ withdrawals })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { withdrawalId, action } = await request.json()
    if (!withdrawalId || !action) {
      return NextResponse.json({ error: "Missing withdrawalId or action" }, { status: 400 })
    }
    
    if (action === "approve") {
      await updateDoc(doc(db, "withdrawals", withdrawalId), {
        status: "approved",
        approvedAt: Timestamp.now()
      })
    } else if (action === "reject") {
      await updateDoc(doc(db, "withdrawals", withdrawalId), {
        status: "rejected",
        rejectedAt: Timestamp.now()
      })
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 })
  }
}
