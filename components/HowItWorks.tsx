"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserPlus, CreditCard, Users, TrendingUp, ArrowRight } from "lucide-react"

export default function HowItWorks() {
  const steps = [
    {
      icon: UserPlus,
      title: "Register Your Account",
      description: "Sign up with your sponsor's referral link and complete your profile with accurate information.",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: CreditCard,
      title: "Activate with PIN",
      description: "Purchase and activate your account with a ₦36,000 PIN to unlock all earning opportunities.",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: Users,
      title: "Build Your Network",
      description: "Invite friends and family to join your network using your unique referral link.",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: TrendingUp,
      title: "Earn Commissions",
      description: "Start earning from 6 levels deep as your network grows and members get activated.",
      color: "bg-orange-100 text-orange-600",
    },
  ]

  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Start your journey to financial freedom in just 4 simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <Card
                key={index}
                className="relative p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="text-center space-y-4">
                  {/* Step Number */}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-[#0066E0] text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center mx-auto`}>
                    <Icon className="w-8 h-8" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Commission Structure */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">6-Level Commission Structure</h3>
            <p className="text-gray-600">Earn from every level of your network with our generous commission plan</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { level: "Level 1", amount: "₦4,000", color: "bg-green-500" },
              { level: "Level 2", amount: "₦2,000", color: "bg-blue-500" },
              { level: "Level 3", amount: "₦2,000", color: "bg-purple-500" },
              { level: "Level 4", amount: "₦1,500", color: "bg-orange-500" },
              { level: "Level 5", amount: "₦1,500", color: "bg-red-500" },
              { level: "Level 6", amount: "₦1,500", color: "bg-indigo-500" },
            ].map((commission, index) => (
              <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
                <div
                  className={`w-12 h-12 ${commission.color} rounded-full flex items-center justify-center mx-auto mb-2`}
                >
                  <span className="text-white font-bold text-sm">{index + 1}</span>
                </div>
                <p className="text-sm font-medium text-gray-900">{commission.level}</p>
                <p className="text-lg font-bold text-gray-900">{commission.amount}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 mb-4">
              <strong>Total Potential:</strong> ₦12,500 per referral across all 6 levels
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button size="lg" className="bg-[#0066E0] hover:bg-[#00266C] text-white px-8 py-4" asChild>
            <Link href="/auth/register">
              Start Building Your Network Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
