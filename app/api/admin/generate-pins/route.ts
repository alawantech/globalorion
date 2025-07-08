import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, Timestamp, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

function generateRandomPin(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let pin = ""
  for (let i = 0; i < length; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return pin
}

export async function POST(request: NextRequest) {
  try {
    const { count, adminUid } = await request.json()
    if (!count || count < 1 || count > 100) {
      return NextResponse.json({ error: "Invalid count" }, { status: 400 })
    }
    if (!adminUid) {
      return NextResponse.json({ error: "Missing adminUid" }, { status: 401 })
    }

    // Check if user is admin in Firestore (client SDK, must be called from authenticated client)
    const adminDoc = await getDoc(doc(db, "users", adminUid))
    if (!adminDoc.exists()) {
      return NextResponse.json({ error: "Not authorized: user not found" }, { status: 403 })
    }
    const role = adminDoc.data().role
    if (role !== "admin") {
      return NextResponse.json({ error: "Not authorized: not admin" }, { status: 403 })
    }

    // Check Firestore rules: only allow admin to write pins
    // The request must be authenticated as admin in the client
    // If you still get "Failed to generate PINs", check:
    // 1. The logged-in user is actually an admin in Firestore
    // 2. Your Firestore rules for /pins/{pinId} are:
    //    allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "admin";

    // Make sure the client is authenticated (logged in) and sending the correct adminUid

    const pinsRef = collection(db, "pins")
    const newPins = []
    for (let i = 0; i < count; i++) {
      const pinCode = generateRandomPin(8)
      const pinDoc = await addDoc(pinsRef, {
        pin: pinCode,
        status: "unused",
        assignedTo: null,
        createdAt: Timestamp.now(),
      })
      newPins.push({ id: pinDoc.id, pin: pinCode })
    }

    return NextResponse.json({
      success: true,
      pins: newPins,
      message: `Generated ${count} PIN(s) successfully`,
    })
  } catch (error) {
    // Log the error for debugging
    console.error("PIN generation error:", error)
    // Add more error details for debugging
    return NextResponse.json({ error: "Failed to generate PINs", details: error?.message || String(error) }, { status: 500 })
  }
}