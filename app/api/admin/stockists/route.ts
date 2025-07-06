import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getDatabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || !decoded.isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const db = getDatabase()

    // Get stockists with user information
    const stockists = db.stockists
      .map((stockist) => {
        const user = db.users.find((u) => u.id === stockist.userId)
        return {
          ...stockist,
          user: user
            ? {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                memberId: user.memberId,
              }
            : null,
        }
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ stockists })
  } catch (error) {
    console.error("Get stockists error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
