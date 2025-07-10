import { type NextRequest, NextResponse } from "next/server"
// import { verifyToken } from "@/lib/auth"
// import { getDatabase } from "@/lib/db"

// ...replace with Firestore/Firebase logic or leave as a placeholder for now...

/*
Old/legacy code commented out for Firebase deployment.
This file should be replaced with Firestore logic only, or left empty for now.

export async function GET(request: NextRequest) {
  try {
    // TODO: Implement authentication and admin check with Firebase if needed

    // TODO: Fetch stockists from Firestore instead of old db
    // Example placeholder:
    // const stockists = await getStockistsFromFirestore()

    return NextResponse.json({ stockists: [] }) // Return empty array or Firestore data
  } catch (error) {
    console.error("Get stockists error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
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
*/
