import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, Timestamp, getDoc, doc, updateDoc } from "firebase/firestore"
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
        status: "unused", // "unused", "sent", "used"
        assignedTo: null, // userId of recipient if sent
        sentAt: null,     // Timestamp when sent
        usedBy: null,     // userId of user who used it
        usedAt: null,     // Timestamp when used
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

// --- New PATCH endpoint to mark pin as sent ---
export async function PATCH(request: NextRequest) {
  try {
    const { pinId } = await request.json()
    if (!pinId) {
      return NextResponse.json({ error: "Missing pinId" }, { status: 400 })
    }
    const pinDocRef = doc(db, "pins", pinId)
    await updateDoc(pinDocRef, {
      status: "sent",
      sentAt: Timestamp.now(),
    })
    return NextResponse.json({ success: true, message: "Pin marked as sent" })
  } catch (error) {
    console.error("Mark pin as sent error:", error)
    return NextResponse.json({ error: "Failed to mark pin as sent", details: error?.message || String(error) }, { status: 500 })
  }
}

// --- New PATCH endpoint to mark pin as used ---
export async function PUT(request: NextRequest) {
  try {
    const { pinId, usedBy } = await request.json()
    if (!pinId || !usedBy) {
      return NextResponse.json({ error: "Missing pinId or usedBy" }, { status: 400 })
    }
    const pinDocRef = doc(db, "pins", pinId)
    await updateDoc(pinDocRef, {
      status: "used",
      usedBy,
      usedAt: Timestamp.now(),
    })
    return NextResponse.json({ success: true, message: "Pin marked as used" })
  } catch (error) {
    console.error("Mark pin as used error:", error)
    return NextResponse.json({ error: "Failed to mark pin as used", details: error?.message || String(error) }, { status: 500 })
  }
}