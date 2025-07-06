import nodemailer from "nodemailer"

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string
  subject: string
  html: string
  text?: string
}) {
  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || "noreply@brightorian.com",
      to,
      subject,
      html,
      text,
    })

    console.log("Email sent:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Email sending failed:", error)
    return { success: false, error: error.message }
  }
}

export async function sendPinEmail(email: string, pin: string, memberName: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Your Activation PIN - Bright Orion</title>
    </head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px;">Bright Orion</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Your Success Journey Begins</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hello ${memberName}!</h2>
        
        <p style="color: #666; line-height: 1.6;">
          Welcome to Bright Orion! Your activation PIN has been generated successfully.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border-left: 4px solid #667eea;">
          <h3 style="color: #333; margin: 0 0 10px 0;">Your Activation PIN</h3>
          <div style="font-size: 24px; font-weight: bold; color: #667eea; letter-spacing: 2px; font-family: monospace;">
            ${pin}
          </div>
        </div>
        
        <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h4 style="color: #1976d2; margin: 0 0 10px 0;">Next Steps:</h4>
          <ol style="color: #666; margin: 0; padding-left: 20px;">
            <li>Login to your account</li>
            <li>Go to Profile → Activate Account</li>
            <li>Enter your PIN: <strong>${pin}</strong></li>
            <li>Start building your network!</li>
          </ol>
        </div>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          <strong>Important:</strong> Keep this PIN secure and don't share it with anyone.
        </p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center;">
          © 2024 Bright Orion. All rights reserved.<br>
          This email was sent to ${email}
        </p>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: "Your Bright Orion Activation PIN",
    html,
    text: `Hello ${memberName}! Your Bright Orion activation PIN is: ${pin}`,
  })
}
