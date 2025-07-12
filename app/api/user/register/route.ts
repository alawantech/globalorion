import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/firebase"
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from "firebase/firestore"

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, pin } = await req.json()
    // ...validate input...

    // Check for an unused pin (either provided or pick the first available)
    let pinDoc
    if (pin) {
      const pinSnap = await getDocs(query(collection(db, "pins"), where("code", "==", pin), where("status", "==", "unused")))
      if (!pinSnap.empty) {
        pinDoc = pinSnap.docs[0]
      }
    }
    if (!pinDoc) {
      // If no pin provided or not found, pick the first unused pin
      const unusedSnap = await getDocs(query(collection(db, "pins"), where("status", "==", "unused")))
      if (unusedSnap.empty) {
        return NextResponse.json({ error: "No unused PINs available" }, { status: 400 })
      }
      pinDoc = unusedSnap.docs[0]
    }

    // Register the user (add to users collection, etc.)
    // ...your user creation logic here...
    const userRef = await addDoc(collection(db, "users"), {
      email,
      name,
      // ...other user fields...
      pin: pinDoc.data().code,
      registeredAt: new Date(),
    })

    // Mark the pin as used
    await updateDoc(doc(db, "pins", pinDoc.id), {
      status: "used",
      usedBy: userRef.id,
      usedAt: new Date(),
    })

    // ...any other registration logic...

    // Respond with success and user info
    return NextResponse.json({ success: true, userId: userRef.id })
  } catch (error) {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
