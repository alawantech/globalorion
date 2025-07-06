import { type NextRequest, NextResponse } from "next/server"
import { initializePaystackPayment } from "@/lib/payment/paystack"
import { verifyToken } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = verifyToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { packageType } = await request.json()

    const amount = 36000 * 100 // Convert to kobo
    const reference = `BO_${user.memberId}_${Date.now()}`

    const paymentData = {
      email: user.email,
      amount,
      reference,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/verify`,
      metadata: {
        memberId: user.memberId,
        packageType,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    }

    const result = await initializePaystackPayment(paymentData)

    if (result.status) {
      return NextResponse.json({
        success: true,
        authorization_url: result.data.authorization_url,
        reference: result.data.reference,
      })
    } else {
      return NextResponse.json({ error: "Payment initialization failed" }, { status: 400 })
    }
  } catch (error) {
    console.error("Payment initialization error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
