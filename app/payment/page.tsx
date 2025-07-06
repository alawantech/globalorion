"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, CreditCard, Smartphone, Building, AlertCircle } from "lucide-react"

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState("card")
  const [isProcessing, setIsProcessing] = useState(false)
  const [userInfo, setUserInfo] = useState<any>(null)
  const [packageInfo, setPackageInfo] = useState<any>(null)

  useEffect(() => {
    // Get user and package info from localStorage
    const pendingUser = localStorage.getItem("pending_user")
    const packageData = localStorage.getItem("package_info")

    if (pendingUser) {
      setUserInfo(JSON.parse(pendingUser))
    }
    if (packageData) {
      setPackageInfo(JSON.parse(packageData))
    }
  }, [])

  const paymentMethods = [
    {
      id: "card",
      name: "Debit/Credit Card",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Pay with your Visa, Mastercard, or Verve card",
    },
    {
      id: "transfer",
      name: "Bank Transfer",
      icon: <Building className="h-5 w-5" />,
      description: "Direct bank transfer",
    },
    {
      id: "ussd",
      name: "USSD",
      icon: <Smartphone className="h-5 w-5" />,
      description: "Pay using your mobile banking USSD",
    },
  ]

  const handlePayment = async () => {
    setIsProcessing(true)

    try {
      const paymentData = {
        userId: userInfo?.memberId,
        userEmail: userInfo?.email,
        userName: userInfo?.fullName,
        amount: packageInfo?.price || 36000,
        paymentMethod: selectedMethod,
        needsPin: userInfo?.pinMethod === "new" || !userInfo?.pin,
      }

      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentData),
      })

      const result = await response.json()

      if (result.success) {
        // Store payment result for success page
        localStorage.setItem("payment_result", JSON.stringify(result))

        // Redirect to success page
        window.location.href = "/payment/success"
      } else {
        alert("Payment failed: " + result.error)
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (!userInfo || !packageInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0066E0]/10 to-[#00266C]/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Session Expired</h2>
            <p className="text-muted-foreground mb-4">Please complete registration first.</p>
            <Button asChild className="w-full">
              <a href="/auth/register">Go to Registration</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066E0]/10 to-[#00266C]/10 p-4">
      <div className="container max-w-4xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#0066E0] mb-2">Complete Your Payment</h1>
          <p className="text-muted-foreground">Secure your spot in the Bright Orion matrix system</p>
          {userInfo?.pinMethod === "new" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your activation PIN will be sent to your email after successful payment.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Customer Information</h4>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Name:</strong> {userInfo.fullName}
                  </p>
                  <p>
                    <strong>Email:</strong> {userInfo.email}
                  </p>
                  <p>
                    <strong>Member ID:</strong> {userInfo.memberId}
                  </p>
                  <p>
                    <strong>PIN Method:</strong>{" "}
                    {userInfo.pinMethod === "new" ? "Generate New PIN" : "Using Existing PIN"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-[#0066E0]/5 rounded-lg">
                <div>
                  <h3 className="font-semibold">{packageInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">One-time activation fee</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#0066E0]">₦{packageInfo.price.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Package Includes:</h4>
                {packageInfo.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-[#0066E0]">₦{packageInfo.price.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedMethod === method.id
                        ? "border-[#0066E0] bg-[#0066E0]/5"
                        : "border-gray-200 hover:border-[#0066E0]/50"
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          selectedMethod === method.id ? "bg-[#0066E0] text-white" : "bg-gray-100"
                        }`}
                      >
                        {method.icon}
                      </div>
                      <div>
                        <h4 className="font-semibold">{method.name}</h4>
                        <p className="text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && <Badge className="ml-auto bg-[#0066E0]">Selected</Badge>}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handlePayment}
                  className="w-full bg-[#0066E0] hover:bg-[#00266C] py-3 text-lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing Payment..." : `Pay ₦${packageInfo.price.toLocaleString()} Now`}
                </Button>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                <p>🔒 Your payment is secured with 256-bit SSL encryption</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
