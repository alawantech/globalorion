import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const uid = searchParams.get("uid")
    if (!uid) {
      return NextResponse.json({ error: "Missing uid" }, { status: 400 })
    }
    const userDoc = await getDoc(doc(db, "users", uid))
    if (!userDoc.exists()) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json(userDoc.data())
  } catch (error) {
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 })
  }
}
