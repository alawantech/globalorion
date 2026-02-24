import { NextRequest, NextResponse } from "next/server"
import { getUser } from "@/lib/auth"
import { getUserByUserId } from "@/lib/firestore-utils"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const user = await getUser(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userData = await getUserByUserId(user.userId)
    if (!userData || !userData.stockist) {
      return NextResponse.json({ error: "Stockist profile not found" }, { status: 404 })
    }

    return NextResponse.json({ stockist: userData.stockist })
  } catch (error) {
    console.error("Get stockist profile error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
