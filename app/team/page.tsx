"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Star, Mail, Linkedin, CheckCircle, TrendingUp, Shield, Heart } from "lucide-react"

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-[#0066E0] to-[#00266C] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Meet Our Team</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            The dedicated professionals behind your success at Bright Orion
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Expert Leadership</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Proven Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Member-Focused</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LeadershipSection() {
  const leaders = [
    {
      id: 1,
      name: "Dr. Ahmed Musa",
      position: "Chief Executive Officer",
      department: "Executive Leadership",
      image: "/images/african-ceo.png",
      bio: "With over 15 years in financial services and network marketing, Dr. Ahmed leads Bright Orion with vision and integrity. He holds an MBA in Finance and has helped thousands achieve financial freedom.",
      achievements: [
        "15+ Years Experience",
        "MBA Finance",
        "Founded 3 Successful Companies",
        "Mentored 10,000+ People",
      ],
      email: "ahmed.musa@brightorian.com",
      linkedin: "#",
      specialties: ["Strategic Leadership", "Financial Planning", "Business Development"],
    },
    {
      id: 2,
      name: "Mrs. Khadijah Ibrahim",
      position: "Chief Operating Officer",
      department: "Operations",
      image: "/images/african-coo.png",
      bio: "Khadijah oversees daily operations and ensures seamless member experience. Her background in operations management and customer service excellence drives our operational success.",
      achievements: ["12+ Years Operations", "Customer Service Expert", "Process Optimization", "Team Leadership"],
      email: "khadijah.ibrahim@brightorian.com",
      linkedin: "#",
      specialties: ["Operations Management", "Customer Experience", "Process Improvement"],
    },
    {
      id: 3,
      name: "Engr. Yusuf Abdullahi",
      position: "Chief Technology Officer",
      department: "Technology",
      image: "/images/african-cto.png",
      bio: "Yusuf leads our technology initiatives, ensuring our platform remains secure, scalable, and user-friendly. His expertise in fintech and blockchain keeps us at the forefront of innovation.",
      achievements: ["10+ Years Tech", "Fintech Expert", "Blockchain Specialist", "Security Certified"],
      email: "yusuf.abdullahi@brightorian.com",
      linkedin: "#",
      specialties: ["Platform Development", "Security", "Innovation"],
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-4">Executive Leadership</h2>
          <p className="text-xl text-muted-foreground">Meet the visionaries leading Bright Orion to success</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {leaders.map((leader) => (
            <Card key={leader.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src={leader.image || "/placeholder.svg"}
                    alt={leader.name}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <Badge className="absolute top-4 right-4 bg-[#0066E0] text-white">{leader.department}</Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-xl text-[#0066E0]">{leader.name}</CardTitle>
                <p className="text-muted-foreground font-medium">{leader.position}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">{leader.bio}</p>

                <div>
                  <h4 className="font-semibold mb-2">Key Achievements:</h4>
                  <div className="grid grid-cols-2 gap-1">
                    {leader.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                        <span className="text-xs">{achievement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Specialties:</h4>
                  <div className="flex flex-wrap gap-1">
                    {leader.specialties.map((specialty, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <a href={`mailto:${leader.email}`} className="text-[#0066E0] hover:text-[#00266C] transition-colors">
                    <Mail className="h-5 w-5" />
                  </a>
                  <a href={leader.linkedin} className="text-[#0066E0] hover:text-[#00266C] transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function DepartmentsSection() {
  const departments = [
    {
      name: "Customer Success",
      head: "Mrs. Fatima Abdullahi",
      members: 8,
      description: "Dedicated to ensuring every member achieves their financial goals",
      responsibilities: ["Member Support", "Training Programs", "Success Coaching", "Community Building"],
      icon: <Users className="h-8 w-8" />,
    },
    {
      name: "Technical Support",
      head: "Mr. Ibrahim Sani",
      members: 6,
      description: "Keeping our platform running smoothly 24/7",
      responsibilities: ["Platform Maintenance", "Bug Fixes", "Security Updates", "Performance Optimization"],
      icon: <Shield className="h-8 w-8" />,
    },
    {
      name: "Finance & Payments",
      head: "Mrs. Aisha Mohammed",
      members: 5,
      description: "Managing all financial transactions and member payouts",
      responsibilities: ["Payment Processing", "Commission Calculations", "Financial Reporting", "Compliance"],
      icon: <TrendingUp className="h-8 w-8" />,
    },
    {
      name: "Marketing & Growth",
      head: "Mr. Usman Garba",
      members: 4,
      description: "Driving growth and expanding our community",
      responsibilities: ["Digital Marketing", "Partnership Development", "Content Creation", "Brand Management"],
      icon: <Award className="h-8 w-8" />,
    },
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-4">Our Departments</h2>
          <p className="text-xl text-muted-foreground">Specialized teams working together for your success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {departments.map((dept, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-[#0066E0]">{dept.icon}</div>
                  <div>
                    <CardTitle className="text-xl text-[#0066E0]">{dept.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Led by {dept.head} • {dept.members} team members
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{dept.description}</p>

                <div>
                  <h4 className="font-semibold mb-2">Key Responsibilities:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {dept.responsibilities.map((responsibility, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{responsibility}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ValuesSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-4">Our Team Values</h2>
          <p className="text-xl text-muted-foreground">The principles that guide everything we do</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle className="text-xl">Integrity First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We operate with complete transparency and honesty in all our dealings with members and partners.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Heart className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle className="text-xl">Member-Centric</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Every decision we make is focused on creating value and success for our community members.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle className="text-xl">Continuous Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We're committed to continuous learning, innovation, and improvement in everything we do.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

function JoinTeamSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-[#0066E0] to-[#00266C] text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Team</h2>
        <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
          Are you passionate about helping others achieve financial freedom? Join our growing team of professionals
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Button size="lg" className="bg-white text-[#0066E0] hover:bg-gray-100 px-8 py-4 text-lg" asChild>
            <Link href="/contact">View Open Positions</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-white border-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
            asChild
          >
            <Link href="/contact">Send Your Resume</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default function TeamPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <LeadershipSection />
        <DepartmentsSection />
        <ValuesSection />
        <JoinTeamSection />
      </main>
      <Footer />
    </div>
  )
}
