import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(request: NextRequest) {
  try {
    // Fetch only available pins (status: "unused")
    const pinsSnap = await getDocs(query(collection(db, "pins"), where("status", "==", "unused")))
    const availablePins = pinsSnap.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data()
    }))

    // Fetch total users
    const usersSnap = await getDocs(collection(db, "users"))
    const totalUsers = usersSnap.size

    return NextResponse.json({
      availablePins,
      totalUsers
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Failed to load available pins or users" }, { status: 500 })
  }
}