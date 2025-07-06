"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Copy, Download, Key, Eye, EyeOff, Package } from "lucide-react"

export default function PaymentSuccessPage() {
  const [paymentResult, setPaymentResult] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [showPin, setShowPin] = useState(false)

  useEffect(() => {
    // Get payment result from localStorage
    const result = localStorage.getItem("payment_result")
    if (result) {
      setPaymentResult(JSON.parse(result))
    }
  }, [])

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!paymentResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-[#0066E0]/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p>Loading payment details...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-[#0066E0]/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-600">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">Welcome to the Bright Orion family</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">🎉 Congratulations!</h3>
            <p className="text-green-700">
              Your payment of ₦{paymentResult.payment?.amount?.toLocaleString()} has been successfully processed. You
              are now part of our 6-level matrix system!
            </p>
          </div>

          {/* Tracking Number */}
          <div className="bg-[#0066E0]/5 p-6 rounded-lg border border-[#0066E0]/20">
            <h3 className="font-semibold text-[#0066E0] mb-3 flex items-center gap-2">
              <Package className="h-5 w-5" />
              Your Package Tracking Number
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <code className="bg-white px-3 py-2 rounded border text-lg font-mono flex-1">
                {paymentResult.trackingNumber}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(paymentResult.trackingNumber, "tracking")}
                className="flex items-center gap-1"
              >
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Use this number to collect your package from our office (3-5 business days).
            </p>
          </div>

          {/* Activation PIN (if generated) */}
          {paymentResult.activationPin && (
            <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                <Key className="h-5 w-5" />
                Your Activation PIN
              </h3>
              <div className="flex items-center gap-2 mb-2">
                <code className="bg-white px-3 py-2 rounded border text-lg font-mono flex-1">
                  {showPin ? paymentResult.activationPin : "••••••••••••"}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPin(!showPin)}
                  className="flex items-center gap-1"
                >
                  {showPin ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showPin ? "Hide" : "Show"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paymentResult.activationPin, "pin")}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
              <div className="bg-orange-100 p-3 rounded border border-orange-300 mt-3">
                <p className="text-sm text-orange-800 font-medium">
                  ⚠️ Important: Save this PIN securely! You'll need it to activate your account and start earning.
                </p>
                <p className="text-sm text-orange-700 mt-1">
                  This PIN has also been sent to your email address for safekeeping.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Next Steps:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Check your email for confirmation</li>
                {paymentResult.activationPin && <li>• Use your PIN to activate account</li>}
                <li>• Access your dashboard</li>
                <li>• Start referring people</li>
                <li>• Track your earnings</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Package Collection:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Visit our office within 3-5 business days</li>
                <li>• Bring your tracking number</li>
                <li>• Contact support if needed</li>
                <li>• Package includes welcome materials</li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1 bg-[#0066E0] hover:bg-[#00266C]">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Receipt
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>
              Need help? Contact our support team at{" "}
              <a href="mailto:support@brightorian.com" className="text-[#0066E0] hover:underline">
                support@brightorian.com
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
