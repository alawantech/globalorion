"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Store, ArrowLeft, CheckCircle, DollarSign, TrendingUp, Users } from "lucide-react"
import Link from "next/link"

export default function StockistRegisterPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    licenseNumber: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/stockist/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Stockist application submitted successfully! Awaiting admin approval.",
        })
        router.push("/dashboard")
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to submit application",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1)
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const benefits = [
    {
      icon: DollarSign,
      title: "10% Commission",
      description: "Earn 10% on every sale you make",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: TrendingUp,
      title: "Wholesale Pricing",
      description: "Get products at wholesale rates",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Users,
      title: "Marketing Support",
      description: "Get marketing materials and support",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: CheckCircle,
      title: "Monthly Bonuses",
      description: "Performance-based monthly rewards",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header with Animation */}
        <div className="mb-8 animate-fade-in-up">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>

          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-bounce-slow">
              <Store className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up animation-delay-200">
              Become a <span className="text-gradient">Stockist</span>
            </h1>
            <p className="text-xl text-gray-600 animate-fade-in-up animation-delay-400">
              Join our network of authorized stockists and earn additional income
            </p>
          </div>
        </div>

        {/* Benefits Section with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={benefit.title}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 animate-fade-in-up`}
                style={{ animationDelay: `${600 + index * 100}ms` }}
              >
                <div className={`w-12 h-12 ${benefit.bgColor} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className={`h-6 w-6 ${benefit.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            )
          })}
        </div>

        {/* Progress Steps */}
        <div className="mb-8 animate-fade-in-up animation-delay-1000">
          <div className="flex items-center justify-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step <= currentStep ? "bg-blue-600 text-white shadow-lg" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step < currentStep ? <CheckCircle className="h-5 w-5" /> : step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      step < currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-4 space-x-16">
            <span className={`text-sm ${currentStep >= 1 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
              Business Info
            </span>
            <span className={`text-sm ${currentStep >= 2 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
              Banking Details
            </span>
            <span className={`text-sm ${currentStep >= 3 ? "text-blue-600 font-medium" : "text-gray-500"}`}>
              Review & Submit
            </span>
          </div>
        </div>

        {/* Form Card with Slide Animation */}
        <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm animate-slide-in-up animation-delay-1200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl text-gray-900">
              {currentStep === 1 && "Business Information"}
              {currentStep === 2 && "Banking Details"}
              {currentStep === 3 && "Review & Submit"}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {currentStep === 1 && "Tell us about your business"}
              {currentStep === 2 && "Provide your banking information for payments"}
              {currentStep === 3 && "Review your information and submit"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Step 1: Business Information */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessName" className="text-gray-700 font-medium">
                        Business Name *
                      </Label>
                      <Input
                        id="businessName"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleInputChange}
                        required
                        placeholder="Your business name"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessPhone" className="text-gray-700 font-medium">
                        Business Phone *
                      </Label>
                      <Input
                        id="businessPhone"
                        name="businessPhone"
                        type="tel"
                        value={formData.businessPhone}
                        onChange={handleInputChange}
                        required
                        placeholder="+234 xxx xxx xxxx"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress" className="text-gray-700 font-medium">
                      Business Address *
                    </Label>
                    <Input
                      id="businessAddress"
                      name="businessAddress"
                      value={formData.businessAddress}
                      onChange={handleInputChange}
                      required
                      placeholder="Complete business address"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="businessEmail" className="text-gray-700 font-medium">
                        Business Email *
                      </Label>
                      <Input
                        id="businessEmail"
                        name="businessEmail"
                        type="email"
                        value={formData.businessEmail}
                        onChange={handleInputChange}
                        required
                        placeholder="business@example.com"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="licenseNumber" className="text-gray-700 font-medium">
                        Business License (Optional)
                      </Label>
                      <Input
                        id="licenseNumber"
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        placeholder="License number if available"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Banking Information */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="bankName" className="text-gray-700 font-medium">
                      Bank Name *
                    </Label>
                    <Input
                      id="bankName"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleInputChange}
                      required
                      placeholder="Your bank name"
                      className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="accountNumber" className="text-gray-700 font-medium">
                        Account Number *
                      </Label>
                      <Input
                        id="accountNumber"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        required
                        placeholder="10-digit account number"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accountName" className="text-gray-700 font-medium">
                        Account Name *
                      </Label>
                      <Input
                        id="accountName"
                        name="accountName"
                        value={formData.accountName}
                        onChange={handleInputChange}
                        required
                        placeholder="Account holder name"
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
                    <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Payment Information
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Commission payments are made weekly
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        Minimum payout threshold: ₦5,000
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                        All transactions are secure and encrypted
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-gray-50 p-6 rounded-xl">
                    <h4 className="font-semibold text-gray-900 mb-4">Review Your Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Business Name</p>
                        <p className="font-medium">{formData.businessName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Business Phone</p>
                        <p className="font-medium">{formData.businessPhone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Business Email</p>
                        <p className="font-medium">{formData.businessEmail}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Bank Name</p>
                        <p className="font-medium">{formData.bankName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      What Happens Next?
                    </h4>
                    <ul className="text-sm text-green-800 space-y-2">
                      <li>• Your application will be reviewed within 24-48 hours</li>
                      <li>• You'll receive an email notification about the status</li>
                      <li>• Once approved, you can start ordering stock</li>
                      <li>• Training materials will be provided</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-6">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="transition-all duration-200 hover:scale-105"
                  >
                    Previous
                  </Button>
                )}

                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="ml-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 hover:scale-105"
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={loading}
                    className="ml-auto bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </div>
                    ) : (
                      "Submit Application"
                    )}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-bounce-slow {
          animation: bounce 3s infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        .animate-slide-in-up {
          animation: slideInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(40px);
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
          opacity: 0;
        }
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        .animation-delay-1000 {
          animation-delay: 1000ms;
        }
        .animation-delay-1200 {
          animation-delay: 1200ms;
        }
        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
