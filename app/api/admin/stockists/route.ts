import { NextRequest, NextResponse } from "next/server"
import { collection, query, getDocs, where, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getUser } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)

    if (!user || user.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const usersRef = collection(db, "users")
    const q = query(usersRef, where("role", "==", "stockist"), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const stockists = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data() as any
    }))

    return NextResponse.json({ stockists })
  } catch (error) {
    console.error("Stockists fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
