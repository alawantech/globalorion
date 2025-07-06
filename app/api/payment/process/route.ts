import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/database"
import { users, activationPins, payments } from "@/lib/database"
import { eq } from "drizzle-orm"
import { emailService } from "@/lib/email-service"

function generatePin(): string {
  return "PIN" + Math.random().toString(36).substr(2, 8).toUpperCase()
}

function generateTrackingNumber(): string {
  return "TRK" + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    console.log("💳 Processing payment...")

    const body = await request.json()
    const { userId, userEmail, userName, amount, paymentMethod, needsPin } = body

    // Get user data
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    // Generate tracking number
    const trackingNumber = generateTrackingNumber()

    // Create payment record
    const payment = await db
      .insert(payments)
      .values({
        userId: user.id,
        amount,
        type: "registration",
        status: "completed",
        reference: trackingNumber,
        completedAt: new Date(),
      })
      .returning()

    let activationPin = null

    // Generate PIN if needed (for new users buying package)
    if (needsPin) {
      activationPin = generatePin()

      // Create PIN record
      await db.insert(activationPins).values({
        pin: activationPin,
        status: "unused",
        createdBy: 1, // System generated
      })

      // Update user status to active and set activation date
      await db
        .update(users)
        .set({
          status: "active",
          activationDate: new Date(),
        })
        .where(eq(users.id, user.id))

      console.log("✅ Generated PIN for user:", user.email, "PIN:", activationPin)

      // Send email with PIN and tracking number
      try {
        await emailService.sendPaymentConfirmationWithPin(
          user.email,
          user.firstName,
          trackingNumber,
          activationPin,
          amount,
        )
        console.log("📧 Confirmation email sent to:", user.email)
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError)
      }
    } else {
      // For existing PIN users, just send tracking number
      try {
        const template = emailService.getPaymentConfirmationTemplate(user.firstName, trackingNumber)
        await emailService.sendEmail({
          to: user.email,
          from: process.env.FROM_EMAIL || "noreply@brightorian.com",
          subject: template.subject,
          html: template.html,
          text: template.text,
        })
        console.log("📧 Payment confirmation sent to:", user.email)
      } catch (emailError) {
        console.error("❌ Failed to send confirmation email:", emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment processed successfully",
      payment: {
        reference: trackingNumber,
        amount,
        status: "completed",
      },
      trackingNumber,
      activationPin,
      user: {
        id: user.id,
        memberId: user.memberId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        status: needsPin ? "active" : user.status,
      },
    })
  } catch (error) {
    console.error("❌ Payment processing error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
