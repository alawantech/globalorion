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

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log("Email not configured, would send:", { to, subject })
      return true
    }

    await transporter.sendMail({
      from: process.env.FROM_EMAIL || process.env.SMTP_USER,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error("Email send error:", error)
    return false
  }
}

export function getWelcomeEmailTemplate(firstName: string, memberId: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
      <div style="padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Welcome to Bright Orion!</h1>
        <p style="margin: 20px 0; font-size: 18px;">Hello ${firstName},</p>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 10px 0;">Your Account Details:</h3>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Member ID:</strong> ${memberId}</p>
          <p style="margin: 5px 0; font-size: 16px;"><strong>Status:</strong> Active</p>
        </div>
        <p style="margin: 20px 0;">You can now login to your dashboard and start earning!</p>
        <p style="margin: 0;">Best regards,<br><strong>The Bright Orion Team</strong></p>
      </div>
    </div>
  `
}

export function getPinEmailTemplate(firstName: string, pinCode: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
      <div style="padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Your Activation PIN</h1>
        <p style="margin: 20px 0; font-size: 18px;">Hello ${firstName},</p>
        <p style="margin: 20px 0;">Your activation PIN has been generated successfully.</p>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 8px; margin: 20px 0; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 15px 0;">Your PIN Code:</h3>
          <p style="font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 2px;">${pinCode}</p>
        </div>
        <p style="margin: 20px 0;">Use this PIN to complete your registration process.</p>
        <p style="margin: 0;">Best regards,<br><strong>The Bright Orion Team</strong></p>
      </div>
    </div>
  `
}

export function getStockistApprovalTemplate(firstName: string, businessName: string) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 10px; overflow: hidden;">
      <div style="padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Stockist Application Approved!</h1>
        <p style="margin: 20px 0; font-size: 18px;">Hello ${firstName},</p>
        <p style="margin: 20px 0;">Congratulations! Your stockist application for <strong>${businessName}</strong> has been approved.</p>
        <div style="background: rgba(255, 255, 255, 0.1); padding: 20px; border-radius: 8px; margin: 20px 0; backdrop-filter: blur(10px);">
          <h3 style="margin: 0 0 10px 0;">What's Next?</h3>
          <p style="margin: 5px 0;">• Login to your stockist dashboard</p>
          <p style="margin: 5px 0;">• Request your initial stock</p>
          <p style="margin: 5px 0;">• Start selling and earning commissions</p>
        </div>
        <p style="margin: 20px 0;">Welcome to the Bright Orion stockist network!</p>
        <p style="margin: 0;">Best regards,<br><strong>The Bright Orion Team</strong></p>
      </div>
    </div>
  `
}
