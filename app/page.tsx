"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
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

// Fixed stats as requested
const totalEarnings = "₦10M+"
const activeMembers = "20,680+"
const happyMembers = "20,680+"
const totalPaidOut = "₦9m+"

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
}

const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-12 md:py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Content */}
            <motion.div
              className="space-y-6 lg:space-y-8"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">🚀 Nigeria's #1 MLM Platform</Badge>
                </motion.div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 leading-tight">
                  Build Your
                  <motion.span
                    className="text-[#0066E0] block"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Financial Future
                  </motion.span>
                  with Bright Orion
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Join thousands of successful entrepreneurs in Nigeria's most trusted multi-level marketing platform.
                  Start earning today with our proven 6-level matrix system.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-semibold px-8 py-4 text-lg w-full sm:w-auto shadow-lg"
                    asChild
                  >
                    <Link href="/auth/register">
                      Start Earning Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="border-2 border-[#0066E0] !text-[#0066E0] hover:bg-[#0066E0] !hover:text-white px-8 py-4 text-lg bg-transparent transition-all w-full sm:w-auto"
                    asChild
                  >
                    <Link href="/about">
                      <Play className="mr-2 h-5 w-5 fill-current" />
                      Learn More
                    </Link>
                  </Button>
                </motion.div>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.1 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 border-2 border-white"
                      ></motion.div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 font-medium">{activeMembers} Active Members</span>
                </div>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + i * 0.1 }}
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                  <span className="text-sm text-gray-600 ml-1">4.9/5 Rating</span>
                </div>
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <div className="relative w-full h-[350px] md:h-[450px] lg:h-[550px] rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="/images/african-hero.png"
                  alt="Bright Orion Success Story - African Entrepreneur"
                  fill
                  className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
              </div>

              {/* Floating Cards */}
              <motion.div
                className="absolute -top-6 -left-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-gray-700">Live Earnings</span>
                </div>
                <p className="text-xl font-bold text-green-600">₦85,450</p>
              </motion.div>

              <motion.div
                className="absolute -bottom-6 -right-6 bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-xl border border-white/50"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">New Members</span>
                </div>
                <p className="text-xl font-bold text-blue-600">+42 Today</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-white/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {[
              { icon: TrendingUp, label: "Total Earnings", value: totalEarnings, color: "text-green-600", bgColor: "bg-green-50" },
              { icon: Users, label: "Active Members", value: activeMembers, color: "text-blue-600", bgColor: "bg-blue-50" },
              { icon: Star, label: "Happy Members", value: happyMembers, color: "text-yellow-600", bgColor: "bg-yellow-50" },
              { icon: Award, label: "Total Paid Out", value: totalPaidOut, color: "text-purple-600", bgColor: "bg-purple-50" },
            ].map((stat, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="group text-center p-6 hover:shadow-2xl transition-all duration-300 border-none bg-white shadow-md hover:-translate-y-2 relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-full h-1 ${stat.color.replace('text', 'bg')}`} />
                  <CardContent className="p-0 space-y-3 relative z-10">
                    <div className={`w-14 h-14 mx-auto rounded-2xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`w-7 h-7 ${stat.color}`} />
                    </div>
                    <p
                      className="text-2xl md:text-3xl font-black text-gray-900 break-words leading-tight"
                      suppressHydrationWarning
                    >
                      {mounted ? stat.value : ""}
                    </p>
                    <p className="text-sm md:text-base text-gray-500 font-semibold tracking-wide uppercase">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-gray-50/50">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16 space-y-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-1">Our Advantage</Badge>
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900">Why Choose Bright Orion?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide everything you need to build a successful and sustainable MLM business in the modern economy.
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                icon: Shield,
                title: "100% Secure",
                description: "Bank-level security with encrypted transactions and professional-grade data protection.",
                color: "blue"
              },
              {
                icon: TrendingUp,
                title: "Proven System",
                description: "Hyper-optimized 6-level matrix system with guaranteed returns and real-time tracking.",
                color: "green"
              },
              {
                icon: Users,
                title: "Strong Community",
                description: `Join over ${activeMembers} successful members across Nigeria with proactive 24/7 mentorship.`,
                color: "purple"
              },
              {
                icon: Award,
                title: "Fast Payouts",
                description: "Next-gen commission delivery system ensuring instant payments directly to your wallet.",
                color: "orange"
              },
              {
                icon: CheckCircle,
                title: "Easy to Start",
                description: "Onboard in minutes with our streamlined registration process and low activation fee.",
                color: "red"
              },
              {
                icon: Star,
                title: "Top Rated",
                description: "Award-winning platform with a 4.9/5 star satisfaction rating from thousands of members.",
                color: "yellow"
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={fadeInUp} whileHover={{ y: -10 }}>
                <Card className="h-full border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white group overflow-hidden">
                  <div className="p-8 space-y-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-[#0066E0] transition-colors duration-500 shadow-sm">
                      <feature.icon className="w-8 h-8 text-[#0066E0] group-hover:text-white transition-colors duration-500" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-[#0066E0] transition-colors">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <HowItWorks />
        <ClientsSay />
      </motion.div>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0066E0] via-[#004BB3] to-[#00266C]"></div>
        <motion.div
          className="container mx-auto px-4 text-center relative z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">Ready to Start Your Success Journey?</h2>
            <p className="text-xl md:text-2xl text-blue-100 font-medium">
              Join thousands of successful entrepreneurs. Start earning today with just ₦36,000.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="bg-[#FFD700] hover:bg-[#FFC000] text-black font-bold px-10 py-7 text-xl shadow-2xl"
                  asChild
                >
                  <Link href="/auth/register">
                    Register Now - ₦36,000
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#0066E0] px-10 py-7 text-xl bg-transparent transition-all backdrop-blur-sm"
                  asChild
                >
                  <Link href="/contact">Contact Support</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl opacity-50"></div>
      </section>

      <Footer />
    </div>
  )
}
