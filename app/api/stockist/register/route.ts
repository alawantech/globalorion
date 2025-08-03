import { db } from "@/lib/firebase"
import { doc, updateDoc, getDocs, query, collection, where } from "firebase/firestore"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // --- Auth check ---
    // Remove token check for now, allow registration without cookie token
    // const token = request.cookies.get("token")?.value
    // if (!token) {
    //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    // }
    // Use userId from body only
    const body = await request.json()
    const { userId, packageType, packageName, products, pin, ...rest } = body
    if (!userId || !packageType || !packageName || !products || !pin) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // --- PIN validation ---
    const pinSnap = await getDocs(
      query(collection(db, "stockistPins"), where("pin", "==", pin), where("packageType", "==", packageType))
    )
    if (pinSnap.empty) {
      return NextResponse.json({ error: "Invalid PIN for selected package" }, { status: 400 })
    }
    const pinDoc = pinSnap.docs[0]
    const pinData = pinDoc.data()
    if (pinData.status === "used") {
      return NextResponse.json({ error: "PIN already used" }, { status: 400 })
    }
    if (pinData.status !== "unused" && pinData.status !== "sent") {
      return NextResponse.json({ error: "PIN not available" }, { status: 400 })
    }

    // --- Add stockist info to user doc ---
    const userSnap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
    if (userSnap.empty) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    const userDoc = userSnap.docs[0]
    const userRef = doc(db, "users", userDoc.id)
    const stockistObj = {
      ...rest,
      userId,
      packageType,
      packageName,
      products,
      pin,
      status: "approved", // <-- Set status to "approved" immediately
      submittedAt: new Date(),
      approvedAt: new Date(), // <-- Add approvedAt timestamp
    }
    await updateDoc(userRef, {
      stockist: stockistObj,
    })

    // --- Mark PIN as used after 1 minute ---
    setTimeout(async () => {
      await updateDoc(doc(db, "stockistPins", pinDoc.id), {
        status: "used",
        usedBy: userId,
        usedAt: new Date(),
      })
    }, 60000)

    return NextResponse.json({
      success: true,
      message: "Stockist application submitted and approved!",
      stockist: stockistObj,
    })
  } catch (error) {
    console.error("Stockist registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
