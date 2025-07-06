"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Shield, Clock, Award, TrendingUp, Gift, Zap, Crown } from "lucide-react"

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-[#0066E0] to-[#00266C] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Choose Your Package</h1>
          <p className="text-xl mb-8 opacity-90">
            Start your journey to financial freedom with our proven matrix system
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>One-time Payment</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Lifetime Access</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PackagesSection() {
  const packages = [
    {
      id: "starter",
      name: "Starter Package",
      price: 36000,
      popular: true,
      description: "Perfect for beginners starting their matrix journey",
      features: [
        "Access to 6-Level Matrix System",
        "Commission on All Levels",
        "Real-time Dashboard",
        "Email & Phone Support",
        "Training Materials",
        "Referral Link Generation",
        "Mobile App Access",
        "Withdrawal System",
      ],
      bonuses: ["Welcome Bonus: ₦2,000", "Training Videos", "Community Access"],
      icon: <Star className="h-8 w-8" />,
      color: "bg-[#0066E0]",
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0066E0] mb-4">Our Packages</h2>
          <p className="text-xl text-muted-foreground">Choose the perfect package to start your success story</p>
        </div>

        <div className="max-w-4xl mx-auto">
          {packages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative border-2 ${pkg.popular ? "border-[#0066E0] shadow-xl" : "border-gray-200"}`}
            >
              {pkg.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#0066E0] text-white px-6 py-2 text-sm">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`${pkg.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <div className="text-white">{pkg.icon}</div>
                </div>
                <CardTitle className="text-3xl font-bold">{pkg.name}</CardTitle>
                <div className="text-5xl font-bold text-[#0066E0] mt-4">₦{pkg.price.toLocaleString()}</div>
                <p className="text-muted-foreground mt-2">One-time payment</p>
                <p className="text-sm text-muted-foreground mt-2">{pkg.description}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-4 text-lg">Package Features:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold mb-3 text-green-800 flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Bonus Inclusions:
                  </h4>
                  <div className="space-y-2">
                    {pkg.bonuses.map((bonus, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-700">{bonus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4">
                  <Button className="w-full bg-[#0066E0] hover:bg-[#00266C] text-white py-4 text-lg" asChild>
                    <Link href="/auth/register">Get Started Now - ₦{pkg.price.toLocaleString()}</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function MatrixExplanationSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0066E0] mb-4">How Our Matrix System Works</h2>
            <p className="text-xl text-muted-foreground">Understanding your earning potential</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <h3 className="text-2xl font-bold mb-4 text-center">6-Level Matrix Structure</h3>
                <div className="space-y-4">
                  {[
                    { level: 1, members: 5, commission: 4000, total: 20000 },
                    { level: 2, members: 25, commission: 2000, total: 50000 },
                    { level: 3, members: 125, commission: 2000, total: 250000 },
                    { level: 4, members: 625, commission: 1500, total: 937500 },
                    { level: 5, members: 3125, commission: 1500, total: 4687500 },
                    { level: 6, members: 15625, commission: 1500, total: 23437500 },
                  ].map((level) => (
                    <div
                      key={level.level}
                      className="flex justify-between items-center p-3 border rounded-lg hover:bg-[#0066E0]/5 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">Level {level.level}</p>
                        <p className="text-xs text-muted-foreground">{level.members.toLocaleString()} members</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#0066E0]">₦{level.total.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">₦{level.commission.toLocaleString()} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-[#0066E0] to-[#00266C] p-8 rounded-xl text-white">
                <h3 className="text-2xl font-bold mb-4">Total Earning Potential</h3>
                <div className="text-4xl font-bold mb-2">₦29,375,000</div>
                <p className="opacity-90">When all 6 levels are complete</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <Zap className="h-6 w-6 text-[#0066E0]" />
                    <h4 className="font-semibold">Quick Start</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start earning immediately when you refer your first 5 people to Level 1
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="h-6 w-6 text-[#0066E0]" />
                    <h4 className="font-semibold">Exponential Growth</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Each level multiplies by 5, creating exponential earning opportunities
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex items-center gap-3 mb-3">
                    <Crown className="h-6 w-6 text-[#0066E0]" />
                    <h4 className="font-semibold">Lifetime Earnings</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    One-time investment with lifetime earning potential from all levels
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function GuaranteesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0066E0] mb-4">Our Guarantees</h2>
          <p className="text-xl text-muted-foreground">Your success and satisfaction are our priority</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle>100% Secure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bank-level security for all transactions with SSL encryption and secure payment processing
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Clock className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle>24/7 Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Round-the-clock customer support to help you succeed in your matrix journey
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle>Proven Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Over ₦138M paid out to members with a 98.5% success rate and 4+ years of operation
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    {
      question: "How does the matrix system work?",
      answer:
        "Our 6-level matrix system allows you to earn commissions when people join through your referral link. You earn from 6 levels deep, with each level requiring 5 referrals to complete.",
    },
    {
      question: "Is this a one-time payment?",
      answer:
        "Yes! You pay only ₦36,000 once and have lifetime access to the matrix system with no monthly fees or hidden charges.",
    },
    {
      question: "How quickly can I start earning?",
      answer:
        "You can start earning immediately after your first referral joins and makes their payment. Commissions are processed within 24 hours.",
    },
    {
      question: "What support do I get?",
      answer:
        "You get 24/7 customer support, training materials, access to our mobile app, and a dedicated support team to help you succeed.",
    },
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0066E0] mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Get answers to common questions</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#0066E0]">{faq.question}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function ShopPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <PackagesSection />
        <MatrixExplanationSection />
        <GuaranteesSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
