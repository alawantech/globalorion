import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customerName, customerEmail, customerPhone, notes, adminId } = body

    if (!customerName || !customerEmail || !adminId) {
      return NextResponse.json({ error: "Customer name, email, and admin ID are required" }, { status: 400 })
    }

    // Generate custom PIN
    const pin = generateCustomPin()

    // In a real app, you would:
    // 1. Insert PIN into database with customer info
    // 2. Mark PIN as "Reserved" for this customer
    // 3. Log admin action

    const pinData = {
      pin,
      status: "reserved",
      customerName,
      customerEmail,
      customerPhone: customerPhone || null,
      notes: notes || null,
      createdBy: adminId,
      createdAt: new Date().toISOString(),
    }

    console.log("Generated custom PIN:", pinData)

    // Send PIN to customer via email
    const emailSent = await emailService.sendCustomPinEmail(customerEmail, customerName, pin)

    if (!emailSent) {
      return NextResponse.json({ error: "PIN generated but email failed to send" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `PIN generated and sent to ${customerEmail}`,
      pin: pinData,
    })
  } catch (error) {
    console.error("Custom PIN generation error:", error)
    return NextResponse.json({ error: "Failed to generate custom PIN" }, { status: 500 })
  }
}

function generateCustomPin(): string {
  const prefix = "PIN"
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}${timestamp}${random}`
}
