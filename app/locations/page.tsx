"use client"

import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Clock, Car, Building, Users, Calendar, Navigation, CheckCircle } from "lucide-react"

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-[#0066E0] to-[#00266C] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-6">Our Locations</h1>
          <p className="text-lg md:text-xl mb-8 opacity-90">
            Visit our offices for personalized support and face-to-face consultations
          </p>
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>2 Major Cities</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Expert Staff</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Walk-in Welcome</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function LocationsSection() {
  const locations = [
    {
      id: "kano",
      city: "Kano",
      state: "Kano State",
      address: "No. 15 Ahmadu Bello Way, Fagge, Kano State, Nigeria",
      phone: "+234 803 123 4567",
      email: "kano@brightorian.com",
      hours: {
        weekdays: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "Closed",
      },
      services: [
        "New Member Registration",
        "Account Activation",
        "Payment Processing",
        "Technical Support",
        "Training Sessions",
        "Withdrawal Processing",
      ],
      manager: "Malam Ibrahim Sani",
      established: "2021",
      image: "/images/kano-office.png",
      isHeadquarters: true,
    },
    {
      id: "abuja",
      city: "Abuja",
      state: "Federal Capital Territory",
      address: "Suite 204, Emab Plaza, Wuse 2, Abuja, FCT, Nigeria",
      phone: "+234 809 876 5432",
      email: "abuja@brightorian.com",
      hours: {
        weekdays: "8:00 AM - 6:00 PM",
        saturday: "9:00 AM - 4:00 PM",
        sunday: "Closed",
      },
      services: [
        "New Member Registration",
        "Account Activation",
        "Payment Processing",
        "Technical Support",
        "VIP Consultations",
        "Corporate Partnerships",
      ],
      manager: "Mrs. Fatima Abdullahi",
      established: "2022",
      image: "/images/abuja-office.png",
      isHeadquarters: false,
    },
  ]

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-4">Visit Our Offices</h2>
          <p className="text-xl text-muted-foreground">Get personalized support at our conveniently located offices</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {locations.map((location) => (
            <Card key={location.id} className="overflow-hidden hover:shadow-xl transition-shadow relative">
              {location.isHeadquarters && (
                <Badge className="absolute top-4 right-4 z-10 bg-[#0066E0] text-white">Headquarters</Badge>
              )}

              <div className="relative">
                <div className="relative w-full h-64 overflow-hidden">
                  <Image
                    src={location.image || "/placeholder.svg"}
                    alt={`${location.city} Office`}
                    fill
                    className="object-cover object-center"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="absolute inset-0 bg-black/20"></div>
              </div>

              <CardHeader>
                <CardTitle className="text-2xl text-[#0066E0] flex items-center gap-2">
                  <Building className="h-6 w-6" />
                  {location.city} Office
                </CardTitle>
                <p className="text-muted-foreground">{location.state}</p>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Contact Information */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#0066E0] mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{location.address}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-[#0066E0]" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{location.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-[#0066E0]" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">{location.email}</p>
                    </div>
                  </div>
                </div>

                {/* Office Hours */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#0066E0]" />
                    Office Hours
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Monday - Friday:</span>
                      <span className="font-medium">{location.hours.weekdays}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Saturday:</span>
                      <span className="font-medium">{location.hours.saturday}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sunday:</span>
                      <span className="font-medium text-red-600">{location.hours.sunday}</span>
                    </div>
                  </div>
                </div>

                {/* Services */}
                <div>
                  <h4 className="font-semibold mb-3">Services Available</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {location.services.map((service, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{service}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Office Details */}
                <div className="bg-[#0066E0]/5 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-[#0066E0]">Office Manager</p>
                      <p>{location.manager}</p>
                    </div>
                    <div>
                      <p className="font-medium text-[#0066E0]">Established</p>
                      <p>{location.established}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button className="flex-1 bg-[#0066E0] hover:bg-[#00266C]">
                    <Navigation className="h-4 w-4 mr-2" />
                    Get Directions
                  </Button>
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Visit
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

function ServicesSection() {
  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-4">What We Offer at Our Offices</h2>
          <p className="text-xl text-muted-foreground">Comprehensive services to support your success</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Users className="h-8 w-8" />,
              title: "New Member Registration",
              description: "Complete your registration with our expert staff and get started immediately.",
            },
            {
              icon: <CheckCircle className="h-8 w-8" />,
              title: "Account Activation",
              description: "Activate your account on-site and receive your PIN instantly.",
            },
            {
              icon: <Car className="h-8 w-8" />,
              title: "Payment Processing",
              description: "Make secure payments in person with multiple payment options available.",
            },
            {
              icon: <Phone className="h-8 w-8" />,
              title: "Technical Support",
              description: "Get hands-on help with the platform, mobile app, and any technical issues.",
            },
            {
              icon: <Building className="h-8 w-8" />,
              title: "Training Sessions",
              description: "Attend group training sessions to maximize your earning potential.",
            },
            {
              icon: <Calendar className="h-8 w-8" />,
              title: "One-on-One Consultations",
              description: "Schedule private consultations with our success coaches.",
            },
          ].map((service, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-[#0066E0] mb-4">{service.icon}</div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{service.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

function ContactSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0066E0] mb-6">Plan Your Visit</h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8">
            Ready to visit one of our offices? Contact us to schedule an appointment or just walk in during office hours
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-[#0066E0]">Walk-in Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  No appointment needed! Visit us during office hours for immediate assistance.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Bring a valid ID</li>
                  <li>• Have your phone number ready</li>
                  <li>• Bring payment if registering</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-[#0066E0]">Scheduled Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Book an appointment for personalized attention and shorter wait times.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Guaranteed service time</li>
                  <li>• One-on-one consultation</li>
                  <li>• Detailed training session</li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-[#0066E0] hover:bg-[#00266C] px-8 py-4 text-lg" asChild>
              <Link href="/contact">Book Appointment</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-[#0066E0] text-[#0066E0] hover:bg-[#0066E0] hover:text-white px-8 py-4 text-lg bg-transparent"
              asChild
            >
              <Link href="/shop">Register Online</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LocationsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <LocationsSection />
        <ServicesSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
