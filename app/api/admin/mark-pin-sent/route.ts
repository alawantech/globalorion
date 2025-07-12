import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"

export async function POST(req: NextRequest) {
  try {
    const { pinId } = await req.json()
    if (!pinId) return NextResponse.json({ error: "Missing pinId" }, { status: 400 })
    const pinRef = doc(db, "pins", pinId)
    await updateDoc(pinRef, {
      status: "sent",
      sentAt: new Date(),
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to mark pin as sent" }, { status: 500 })
  }
}
