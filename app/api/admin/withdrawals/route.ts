import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET() {
  try {
    const snap = await getDocs(collection(db, "withdrawals"))
    const withdrawals = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    return NextResponse.json({ withdrawals })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch withdrawals" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { withdrawalId } = await request.json()
    if (!withdrawalId) {
      return NextResponse.json({ error: "Missing withdrawalId" }, { status: 400 })
    }
    await updateDoc(doc(db, "withdrawals", withdrawalId), {
      status: "approved",
      approvedAt: Timestamp.now()
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to approve withdrawal" }, { status: 500 })
  }
}
