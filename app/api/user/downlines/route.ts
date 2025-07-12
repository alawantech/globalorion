import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get("userId")
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }
    // Find users whose uplineId matches this userId
    const downlineSnap = await getDocs(query(collection(db, "users"), where("uplineId", "==", userId)))
    const downlines = downlineSnap.docs.map(doc => doc.data())
    return NextResponse.json({ downlines })
  } catch (error) {
    return NextResponse.json({ error: "Failed to load downlines" }, { status: 500 })
  }
}
