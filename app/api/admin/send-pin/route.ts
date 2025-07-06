import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pinId, pin, adminId, customerEmail, customerName } = body

    if (!pinId || !pin || !adminId) {
      return NextResponse.json({ error: "PIN ID, PIN code, and admin ID are required" }, { status: 400 })
    }

    // In a real app, you would:
    // 1. Get PIN details from database
    // 2. Verify PIN is available for sending
    // 3. Get customer email if not provided

    // Mock customer data (in real app, get from database)
    const mockCustomerEmail = customerEmail || "customer@example.com"
    const mockCustomerName = customerName || "Valued Customer"

    // Send PIN via email
    const emailSent = await emailService.sendCustomPinEmail(mockCustomerEmail, mockCustomerName, pin)

    if (!emailSent) {
      return NextResponse.json({ error: "Failed to send PIN via email" }, { status: 500 })
    }

    // In a real app, you would also:
    // 1. Log the admin action
    // 2. Update PIN status if needed
    // 3. Record email sent timestamp

    console.log(`PIN ${pin} sent by admin ${adminId} to ${mockCustomerEmail}`)

    return NextResponse.json({
      success: true,
      message: `PIN sent successfully to ${mockCustomerEmail}`,
    })
  } catch (error) {
    console.error("Send PIN error:", error)
    return NextResponse.json({ error: "Failed to send PIN" }, { status: 500 })
  }
}
