"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

export default function ClientsSay() {
  const testimonials = [
    {
      name: "Adebayo Johnson",
      location: "Lagos, Nigeria",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "Bright Orion has completely transformed my financial situation. In just 6 months, I've built a network of over 200 people and earning consistent monthly income. The support team is amazing!",
      earnings: "₦450,000/month",
    },
    {
      name: "Fatima Abdullahi",
      location: "Abuja, Nigeria",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "I was skeptical at first, but the transparency and genuine support from the community convinced me. Now I'm a team leader with steady passive income. Best decision I ever made!",
      earnings: "₦320,000/month",
    },
    {
      name: "Chinedu Okafor",
      location: "Port Harcourt, Nigeria",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "The 6-level matrix system is brilliant! I love how I can earn from my team's efforts. The training materials and webinars helped me understand the business quickly.",
      earnings: "₦280,000/month",
    },
    {
      name: "Aisha Mohammed",
      location: "Kano, Nigeria",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "As a single mother, this opportunity has been a blessing. The flexible schedule allows me to work around my family time while building a sustainable income stream.",
      earnings: "₦195,000/month",
    },
    {
      name: "Emeka Nwankwo",
      location: "Enugu, Nigeria",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "The stockist program is fantastic! I now have my own distribution center and earning both from sales and network commissions. Double income stream!",
      earnings: "₦520,000/month",
    },
    {
      name: "Blessing Okoro",
      location: "Ibadan, Nigeria",
      image: "/placeholder.svg?height=60&width=60",
      rating: 5,
      text: "What I love most is the community spirit. Everyone helps each other succeed. The monthly recognition events and bonuses keep me motivated to do more.",
      earnings: "₦380,000/month",
    },
  ]

  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Our Members Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from real people who have transformed their lives with Bright Orion
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="space-y-4">
                {/* Quote Icon */}
                <div className="flex justify-between items-start">
                  <Quote className="w-8 h-8 text-[#0066E0] opacity-50" />
                  <div className="flex items-center space-x-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-600 leading-relaxed text-sm">{testimonial.text}</p>

                {/* Earnings Badge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-sm text-green-600 font-medium">Monthly Earnings</p>
                  <p className="text-lg font-bold text-green-700">{testimonial.earnings}</p>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-3 pt-4 border-t">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Success Stats */}
        <div className="mt-12 bg-white rounded-2xl p-8 shadow-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-[#0066E0]">5,000+</p>
              <p className="text-gray-600">Happy Members</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-600">₦50M+</p>
              <p className="text-gray-600">Total Paid Out</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-purple-600">94%</p>
              <p className="text-gray-600">Success Rate</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-orange-600">24/7</p>
              <p className="text-gray-600">Support Available</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
