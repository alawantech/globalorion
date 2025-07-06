// Email service utilities

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailData {
  to: string
  from: string
  subject: string
  html: string
  text?: string
}

export class EmailService {
  private apiKey: string
  private fromEmail: string

  constructor() {
    this.apiKey = process.env.EMAIL_API_KEY || ""
    this.fromEmail = process.env.FROM_EMAIL || "noreply@brightorian.com"
  }

  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      // In a real app, integrate with email service provider
      // Example: SendGrid, Mailgun, AWS SES, etc.
      console.log("Sending email:", emailData)

      // Mock email sending
      await new Promise((resolve) => setTimeout(resolve, 1000))

      return true
    } catch (error) {
      console.error("Email sending failed:", error)
      return false
    }
  }

  getWelcomeEmailTemplate(userName: string, memberId: string): EmailTemplate {
    return {
      subject: "Welcome to Bright Orion!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066E0;">Welcome to Bright Orion, ${userName}!</h2>
          <p>Congratulations on joining our matrix system!</p>
          <p><strong>Your Member ID:</strong> ${memberId}</p>
          <p>You can now start referring people and earning commissions.</p>
          <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Next Steps:</h3>
            <ul>
              <li>Complete your payment to activate your account</li>
              <li>Share your referral link with friends and family</li>
              <li>Track your progress in the dashboard</li>
            </ul>
          </div>
          <p>Best regards,<br>The Bright Orion Team</p>
        </div>
      `,
      text: `Welcome to Bright Orion, ${userName}! Your Member ID: ${memberId}`,
    }
  }

  getPaymentConfirmationTemplate(userName: string, trackingNumber: string): EmailTemplate {
    return {
      subject: "Payment Confirmed - Your Tracking Number",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066E0;">Payment Confirmed!</h2>
          <p>Dear ${userName},</p>
          <p>Your payment has been successfully processed and your account is now active!</p>
          
          <div style="background: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Your Tracking Number</h3>
            <p style="font-size: 18px; font-weight: bold; font-family: monospace;">${trackingNumber}</p>
            <p>Use this number to track your package delivery.</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>What's Next?</h3>
            <ul>
              <li>Your package will be delivered within 3-5 business days</li>
              <li>Start sharing your referral link to earn commissions</li>
              <li>Access your dashboard to track your progress</li>
              <li>Contact support if you need any assistance</li>
            </ul>
          </div>

          <p>Welcome to the Bright Orion family!</p>
          <p>Best regards,<br>The Bright Orion Team</p>
        </div>
      `,
      text: `Payment confirmed! Your tracking number: ${trackingNumber}. Package delivery in 3-5 business days.`,
    }
  }

  getCommissionNotificationTemplate(userName: string, amount: number, level: number): EmailTemplate {
    return {
      subject: `Commission Earned - ₦${amount.toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066E0;">Commission Earned!</h2>
          <p>Dear ${userName},</p>
          <p>Congratulations! You've earned a new commission.</p>
          
          <div style="background: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px; text-center;">
            <h3 style="color: #28a745; margin-top: 0;">Commission Amount</h3>
            <p style="font-size: 24px; font-weight: bold; color: #28a745;">₦${amount.toLocaleString()}</p>
            <p>From Level ${level}</p>
          </div>

          <p>This commission has been added to your pending earnings and will be available for withdrawal once approved.</p>
          <p>Keep sharing your referral link to earn more!</p>
          
          <p>Best regards,<br>The Bright Orion Team</p>
        </div>
      `,
      text: `Commission earned: ₦${amount.toLocaleString()} from Level ${level}`,
    }
  }

  getPaymentConfirmationWithPinTemplate(
    userName: string,
    trackingNumber: string,
    activationPin: string,
    amount: number,
  ): EmailTemplate {
    return {
      subject: "Payment Confirmed - Your Activation PIN & Tracking Number",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066E0;">Payment Confirmed!</h2>
          <p>Dear ${userName},</p>
          <p>Your payment of ₦${amount.toLocaleString()} has been successfully processed and your account is ready for activation!</p>
          
          <div style="background: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745;">
            <h3 style="color: #28a745; margin-top: 0;">Your Activation PIN</h3>
            <p style="font-size: 24px; font-weight: bold; font-family: monospace; background: white; padding: 10px; border-radius: 4px; text-align: center;">${activationPin}</p>
            <p><strong>⚠️ Important:</strong> Keep this PIN secure! You'll need it to activate your account and start earning.</p>
          </div>

          <div style="background: #e3f2fd; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #2196f3;">
            <h3 style="color: #1976d2; margin-top: 0;">Your Tracking Number</h3>
            <p style="font-size: 18px; font-weight: bold; font-family: monospace;">${trackingNumber}</p>
            <p>Use this number to track your package delivery.</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>Next Steps:</h3>
            <ol>
              <li>Use your PIN to complete account activation</li>
              <li>Your package will be delivered within 3-5 business days</li>
              <li>Access your dashboard to start earning</li>
              <li>Share your referral link with friends and family</li>
            </ol>
          </div>

          <p>Welcome to the Bright Orion family!</p>
          <p>Best regards,<br>The Bright Orion Team</p>
        </div>
      `,
      text: `Payment confirmed! Your activation PIN: ${activationPin}. Tracking number: ${trackingNumber}. Package delivery in 3-5 business days.`,
    }
  }

  getCustomPinEmailTemplate(customerName: string, activationPin: string): EmailTemplate {
    return {
      subject: "Your Bright Orion Activation PIN",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0066E0;">Your Activation PIN is Ready!</h2>
          <p>Dear ${customerName},</p>
          <p>Thank you for your offline purchase! Your Bright Orion activation PIN has been generated.</p>
          
          <div style="background: #e8f5e8; padding: 20px; margin: 20px 0; border-radius: 8px; border-left: 4px solid #28a745; text-align: center;">
            <h3 style="color: #28a745; margin-top: 0;">Your Activation PIN</h3>
            <p style="font-size: 32px; font-weight: bold; font-family: monospace; background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">${activationPin}</p>
            <p style="color: #d32f2f; font-weight: bold;">⚠️ Keep this PIN secure and confidential!</p>
          </div>

          <div style="background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3>How to Use Your PIN:</h3>
            <ol>
              <li>Visit our registration page: <a href="https://brightorian.com/auth/register" style="color: #0066E0;">brightorian.com/auth/register</a></li>
              <li>Fill in your details</li>
              <li>Select "I have a PIN" option</li>
              <li>Enter your PIN: <strong>${activationPin}</strong></li>
              <li>Complete your registration</li>
              <li>Start earning with our 6-level matrix system!</li>
            </ol>
          </div>

          <div style="background: #e3f2fd; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <h3 style="color: #1976d2;">What You Get:</h3>
            <ul>
              <li>Access to 6-Level Matrix System</li>
              <li>Commission on All Levels</li>
              <li>Real-time Dashboard</li>
              <li>24/7 Support</li>
              <li>Training Materials</li>
              <li>Referral Link Generation</li>
            </ul>
          </div>

          <p>If you have any questions or need assistance, please contact our support team.</p>
          <p>Welcome to Bright Orion!</p>
          <p>Best regards,<br>The Bright Orion Team</p>
        </div>
      `,
      text: `Your Bright Orion activation PIN: ${activationPin}. Use this to complete your registration at brightorian.com/auth/register`,
    }
  }

  async sendPaymentConfirmationWithPin(
    email: string,
    userName: string,
    trackingNumber: string,
    activationPin: string,
    amount: number,
  ): Promise<boolean> {
    const template = this.getPaymentConfirmationWithPinTemplate(userName, trackingNumber, activationPin, amount)
    return this.sendEmail({
      to: email,
      from: this.fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }

  async sendCustomPinEmail(email: string, customerName: string, activationPin: string): Promise<boolean> {
    const template = this.getCustomPinEmailTemplate(customerName, activationPin)
    return this.sendEmail({
      to: email,
      from: this.fromEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
    })
  }
}

export const emailService = new EmailService()
