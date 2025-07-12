// This API route fetches all users from the Firestore "users" collection,
// then calculates the total number of users, total approved earnings, and total pending commissions.

import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export async function GET(req: NextRequest) {
  try {
    // Check Firestore connection
    if (!db) {
      return NextResponse.json({ error: "Firestore not initialized" }, { status: 500 })
    }

    // Fetch all user documents from the "users" collection
    const usersCollection = collection(db, "users")
    const usersSnap = await getDocs(usersCollection)

    // If collection is empty, return zeros immediately
    if (usersSnap.empty) {
      return NextResponse.json({ totalUsers: 0, totalEarnings: 0, pendingCommissions: 0 })
    }

    // Map user docs to plain objects
    const users = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    const totalUsers = users.length

    let totalEarnings = 0
    let pendingCommissions = 0

    // PIN stats
    // Fetch all PINs from the "pins" collection
    // This fetches every document in the Firestore collection named "pins"
    const pinsSnap = await getDocs(collection(db, "pins"))
    const pins = pinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    // Available PINs: status is "unused"
    const availablePins = pins.filter(
      pin => pin.status === "unused"
    )

    // Sent PINs: status is "sent" (but not used)
    const sentPins = pins.filter(
      pin => pin.status === "sent"
    )

    // Used PINs: status is "used"
    const usedPins = pins.filter(
      pin => pin.status === "used"
    )

    // Only count users that actually exist in Firestore
    users.forEach(user => {
      if (Array.isArray(user.commissions) && user.commissions.length > 0) {
        for (const c of user.commissions) {
          if (c && typeof c.amount === "number") {
            if (c.status === "approved") totalEarnings += c.amount
            if (c.status === "pending") pendingCommissions += c.amount
          }
        }
      }
    })

    // Return the calculated stats as JSON, including PIN stats
    return NextResponse.json(
      {
        totalUsers,
        totalEarnings,
        pendingCommissions,
        availablePins: availablePins.length,
        sentPins: sentPins.length,
        usedPins: usedPins.length,
        availablePinsList: availablePins,
        sentPinsList: sentPins,
        usedPinsList: usedPins
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          "Pragma": "no-cache",
          "Expires": "0",
          "Surrogate-Control": "no-store"
        }
      }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 })
  }
}

// Your API is working correctly and returning the right data:
// {"totalUsers":7,"totalEarnings":0,"pendingCommissions":8000}
// If your frontend still shows zeros, the issue is in your frontend rendering or state logic, not this API route.
// No changes needed here.