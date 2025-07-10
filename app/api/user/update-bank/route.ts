import { NextRequest, NextResponse } from "next/server"
import { doc, updateDoc, getDocs, query, collection, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { userId, bankName, accountNumber, accountName } = await request.json()
    if (!userId || !bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Find user doc by userId (not doc id)
    const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
    if (userSnap.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const userDoc = userSnap.docs[0]

    await updateDoc(doc(db, "users", userDoc.id), {
      bankName,
      accountNumber,
      accountName,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save bank details" }, { status: 500 })
  }
}
