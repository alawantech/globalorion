"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import HowItWorks from "@/components/HowItWorks"
import ClientsSay from "@/components/ClientsSay"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Users, TrendingUp, Shield, Award, Star, CheckCircle, ArrowRight, Play } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6 lg:space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">🚀 Nigeria's #1 MLM Platform</Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  Build Your
                  <span className="text-[#0066E0] block">Financial Future</span>
                  with Bright Orion
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Join thousands of successful entrepreneurs in Nigeria's most trusted multi-level marketing platform.
                  Start earning today with our proven 6-level matrix system.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-semibold px-8 py-4 text-lg"
                  asChild
                >
                  <Link href="/auth/register">
                    Start Earning Now
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-[#0066E0] text-[#0066E0] hover:bg-[#0066E0] hover:text-white px-8 py-4 text-lg bg-transparent"
                  asChild
                >
                  <Link href="/about">
                    <Play className="mr-2 h-5 w-5" />
                    Learn More
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-white"
                      ></div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">5,000+ Active Members</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-gray-600 ml-1">4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Image */}
            <div className="relative">
              <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/african-hero.png"
                  alt="Bright Orion Success Story - African Entrepreneur"
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Live Earnings</span>
                </div>
                <p className="text-lg font-bold text-green-600">₦2,450,000</p>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">New Members</span>
                </div>
                <p className="text-lg font-bold text-blue-600">+127 Today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Users, label: "Active Members", value: "5,000+", color: "text-blue-600" },
              { icon: TrendingUp, label: "Total Earnings", value: "₦50M+", color: "text-green-600" },
              { icon: Award, label: "Success Rate", value: "94%", color: "text-yellow-600" },
              { icon: Shield, label: "Years Trusted", value: "3+", color: "text-purple-600" },
            ].map((stat, index) => (
              <Card key={index} className="text-center p-4 md:p-6 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-2">
                  <stat.icon className={`w-8 h-8 md:w-10 md:h-10 mx-auto ${stat.color}`} />
                  <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm md:text-base text-gray-600">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose Bright Orion?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to build a successful MLM business
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: Shield,
                title: "100% Secure",
                description: "Bank-level security with encrypted transactions and data protection",
              },
              {
                icon: TrendingUp,
                title: "Proven System",
                description: "6-level matrix system with guaranteed returns and transparent tracking",
              },
              {
                icon: Users,
                title: "Strong Community",
                description: "Join 5,000+ successful members across Nigeria with 24/7 support",
              },
              {
                icon: Award,
                title: "Fast Payouts",
                description: "Instant commission payments directly to your bank account",
              },
              {
                icon: CheckCircle,
                title: "Easy to Start",
                description: "Simple registration process with just ₦36,000 activation fee",
              },
              {
                icon: Star,
                title: "Top Rated",
                description: "4.9/5 star rating from thousands of satisfied members",
              },
            ].map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-[#0066E0]" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <HowItWorks />
      <ClientsSay />

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-[#0066E0] to-[#00266C]">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to Start Your Success Journey?</h2>
            <p className="text-lg md:text-xl text-blue-100">
              Join thousands of successful entrepreneurs. Start earning today with just ₦36,000.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-semibold px-8 py-4 text-lg"
                asChild
              >
                <Link href="/auth/register">
                  Register Now - ₦36,000
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-[#0066E0] px-8 py-4 text-lg bg-transparent"
                asChild
              >
                <Link href="/contact">Contact Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
