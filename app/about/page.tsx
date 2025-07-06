"use client"

import Navbar from "@/components/Navbar"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Eye, Heart, Users, Award, TrendingUp, Shield, Clock, CheckCircle, Star } from "lucide-react"
import Footer from "@/components/Footer"

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-[#0066E0] to-[#00266C] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">About Bright Orion</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Empowering individuals to achieve financial freedom through our innovative matrix system since 2020
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>4+ Years of Excellence</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>3,842+ Active Members</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>₦138M+ Paid Out</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function MissionVisionSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center p-6 md:p-8 border-2 border-[#0066E0]/20 hover:border-[#0066E0] transition-colors">
            <CardHeader>
              <Target className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle className="text-2xl text-[#0066E0]">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To provide a transparent, sustainable, and profitable platform that empowers individuals to build
                generational wealth through our innovative matrix system while fostering a community of success.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 md:p-8 border-2 border-[#0066E0]/20 hover:border-[#0066E0] transition-colors">
            <CardHeader>
              <Eye className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle className="text-2xl text-[#0066E0]">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                To become Africa's leading financial empowerment platform, creating millions of financially independent
                individuals and transforming communities across the continent.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-6 md:p-8 border-2 border-[#0066E0]/20 hover:border-[#0066E0] transition-colors">
            <CardHeader>
              <Heart className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle className="text-2xl text-[#0066E0]">Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                Integrity, transparency, community support, innovation, and commitment to our members' success drive
                everything we do at Bright Orion.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function StorySection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-4">Our Story</h2>
            <p className="text-xl text-muted-foreground">The journey that started it all</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
                <Image
                  src="/images/african-business-team.png"
                  alt="Bright Orion Story - African Business Team"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </div>
            <div className="space-y-6">
              <p className="text-lg leading-relaxed">
                Founded in 2020 by a team of financial experts and technology innovators, Bright Orion was born from a
                simple yet powerful vision: to democratize wealth creation and make financial freedom accessible to
                everyone.
              </p>
              <p className="text-lg leading-relaxed">
                Starting with just 50 members, we've grown into a thriving community of over 3,800 active participants
                who have collectively earned over ₦138 million through our proven matrix system.
              </p>
              <p className="text-lg leading-relaxed">
                Our success is built on three pillars: transparency, innovation, and unwavering commitment to our
                members' success. Every feature, every update, and every decision is made with our community's best
                interests at heart.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function AchievementsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-4">Our Achievements</h2>
          <p className="text-xl text-muted-foreground">Milestones that define our success</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          <div className="text-center">
            <div className="bg-[#0066E0]/10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 md:h-10 md:w-10 text-[#0066E0]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#0066E0] mb-2">3,842+</div>
            <div className="text-sm md:text-base text-muted-foreground">Active Members</div>
          </div>

          <div className="text-center">
            <div className="bg-[#0066E0]/10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-[#0066E0]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#0066E0] mb-2">₦138M+</div>
            <div className="text-sm md:text-base text-muted-foreground">Total Payouts</div>
          </div>

          <div className="text-center">
            <div className="bg-[#0066E0]/10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-8 w-8 md:h-10 md:w-10 text-[#0066E0]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#0066E0] mb-2">98.5%</div>
            <div className="text-sm md:text-base text-muted-foreground">Success Rate</div>
          </div>

          <div className="text-center">
            <div className="bg-[#0066E0]/10 w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Star className="h-8 w-8 md:h-10 md:w-10 text-[#0066E0]" />
            </div>
            <div className="text-2xl md:text-3xl font-bold text-[#0066E0] mb-2">4.9/5</div>
            <div className="text-sm md:text-base text-muted-foreground">Member Rating</div>
          </div>
        </div>
      </div>
    </section>
  )
}

function WhyChooseUsSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-4">Why Choose Bright Orion?</h2>
          <p className="text-xl text-muted-foreground">What sets us apart from the rest</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Shield className="h-8 w-8" />,
              title: "Secure & Transparent",
              description: "Bank-level security with complete transparency in all transactions and commissions.",
            },
            {
              icon: <Clock className="h-8 w-8" />,
              title: "Proven Track Record",
              description: "4+ years of consistent payouts and member satisfaction with zero payment delays.",
            },
            {
              icon: <Users className="h-8 w-8" />,
              title: "Strong Community",
              description: "Join a supportive community of like-minded individuals working towards financial freedom.",
            },
            {
              icon: <TrendingUp className="h-8 w-8" />,
              title: "Sustainable Growth",
              description: "Our matrix system is designed for long-term sustainability and continuous growth.",
            },
            {
              icon: <Award className="h-8 w-8" />,
              title: "Expert Support",
              description: "24/7 customer support and training from financial experts and successful members.",
            },
            {
              icon: <CheckCircle className="h-8 w-8" />,
              title: "Simple & Effective",
              description: "Easy-to-understand system with clear earning potential and straightforward processes.",
            },
          ].map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-[#0066E0] mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#0066E0] to-[#00266C] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your Journey?</h2>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Join thousands of successful members who have transformed their financial future with Bright Orion
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" className="bg-white text-[#0066E0] hover:bg-gray-100 px-8 py-4 text-lg" asChild>
            <Link href="/shop">Get Started Today</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-white border-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
            asChild
          >
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <MissionVisionSection />
        <StorySection />
        <AchievementsSection />
        <WhyChooseUsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
