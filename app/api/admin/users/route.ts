import { NextRequest, NextResponse } from "next/server"
import { collection, query, getDocs, orderBy } from "firebase/firestore"
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
    const q = query(usersRef, orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    const allUsers = querySnapshot.docs.map(doc => {
      const data = doc.data() as any
      // Exclude sensitive or unneeded data if necessary
      delete data.password // Should already be absent in Firestore users collection
      return {
        id: doc.id,
        ...data
      }
    })

    return NextResponse.json({ users: allUsers })
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
