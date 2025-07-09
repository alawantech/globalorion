import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, Timestamp, updateDoc, doc, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    const { userId, amount, bankName, accountNumber, accountName } = await request.json()
    if (!userId || !amount || !bankName || !accountNumber || !accountName) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Find the user's Firestore doc by userId (not doc id)
    const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
    if (userSnap.empty) {
      // Try uppercase fallback (for legacy/uppercase userId)
      const userSnapUpper = await getDocs(query(collection(db, "users"), where("userId", "==", userId.toUpperCase())))
      if (userSnapUpper.empty) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      const userDocRef = doc(db, "users", userSnapUpper.docs[0].id)
      await updateDoc(userDocRef, { bankName, accountNumber, accountName })
    } else {
      const userDocRef = doc(db, "users", userSnap.docs[0].id)
      await updateDoc(userDocRef, { bankName, accountNumber, accountName })
    }

    // Add withdrawal request (amount should be a number)
    await addDoc(collection(db, "withdrawals"), {
      userId: userId,
      amount: Number(amount),
      bankName,
      accountNumber,
      accountName,
      status: "pending",
      requestedAt: Timestamp.now(),
      approvedAt: null
    })

    return NextResponse.json({ success: true, message: "Withdrawal request submitted" })
  } catch (error) {
    console.error("Withdrawal request error:", error)
    return NextResponse.json({ error: "Failed to request withdrawal" }, { status: 500 })
  }
}
