"use client"

import type React from "react"

import Navbar from "@/components/Navbar"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Clock, Send, MessageCircle, HelpCircle, CheckCircle, Users, Shield, Award } from "lucide-react"
import Footer from "@/components/Footer"

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-r from-[#0066E0] to-[#00266C] text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl mb-8 opacity-90">
            Get in touch with our team for support, questions, or to start your journey with Bright Orion
          </p>
          <div className="flex justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>24/7 Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Quick Response</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              <span>Expert Help</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
    inquiryType: "general",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ text: "", type: "" })

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMessage({
        text: "Thank you for your message! We'll get back to you within 24 hours.",
        type: "success",
      })
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
        inquiryType: "general",
      })
    } catch (error) {
      setMessage({
        text: "Sorry, there was an error sending your message. Please try again.",
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#0066E0] mb-4">Send Us a Message</h2>
            <p className="text-xl text-muted-foreground">We're here to help with any questions or concerns</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="text-2xl text-[#0066E0] flex items-center gap-2">
                  <MessageCircle className="h-6 w-6" />
                  Get in Touch
                </CardTitle>
              </CardHeader>
              <CardContent>
                {message.text && (
                  <div
                    className={`mb-6 p-4 rounded-lg ${
                      message.type === "success"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    {message.text}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiryType" className="block text-sm font-medium mb-2">
                        Inquiry Type
                      </label>
                      <select
                        id="inquiryType"
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066E0]"
                      >
                        <option value="general">General Inquiry</option>
                        <option value="support">Technical Support</option>
                        <option value="registration">Registration Help</option>
                        <option value="payment">Payment Issues</option>
                        <option value="partnership">Partnership</option>
                        <option value="complaint">Complaint</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium mb-2">
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      placeholder="Brief description of your inquiry"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium mb-2">
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      placeholder="Please provide details about your inquiry..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#0066E0] hover:bg-[#00266C] py-3 text-lg"
                    disabled={isSubmitting}
                  >
                    <Send className="h-5 w-5 mr-2" />
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-xl text-[#0066E0] flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Phone Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">Kano Office</p>
                    <p className="text-muted-foreground">+234 803 123 4567</p>
                  </div>
                  <div>
                    <p className="font-medium">Abuja Office</p>
                    <p className="text-muted-foreground">+234 809 876 5432</p>
                  </div>
                  <div className="bg-[#0066E0]/5 p-3 rounded-lg">
                    <p className="text-sm text-[#0066E0] font-medium">Available 24/7 for urgent support</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-xl text-[#0066E0] flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium">General Inquiries</p>
                    <p className="text-muted-foreground">info@brightorian.com</p>
                  </div>
                  <div>
                    <p className="font-medium">Technical Support</p>
                    <p className="text-muted-foreground">support@brightorian.com</p>
                  </div>
                  <div>
                    <p className="font-medium">Partnership</p>
                    <p className="text-muted-foreground">partners@brightorian.com</p>
                  </div>
                  <div className="bg-[#0066E0]/5 p-3 rounded-lg">
                    <p className="text-sm text-[#0066E0] font-medium">Response within 24 hours</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader>
                  <CardTitle className="text-xl text-[#0066E0] flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Office Hours
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Monday - Friday:</span>
                    <span className="font-medium">8:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday:</span>
                    <span className="font-medium">9:00 AM - 4:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday:</span>
                    <span className="font-medium text-red-600">Closed</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FAQSection() {
  const faqs = [
    {
      question: "How quickly will I receive a response?",
      answer:
        "We aim to respond to all inquiries within 24 hours during business days. For urgent technical issues, our 24/7 phone support is available.",
    },
    {
      question: "Can I visit your offices without an appointment?",
      answer:
        "Yes! We welcome walk-in visits during office hours. However, scheduling an appointment ensures you get dedicated time with our team.",
    },
    {
      question: "What information should I include in my message?",
      answer:
        "Please include your full name, contact information, and a detailed description of your inquiry. If it's account-related, include your member ID.",
    },
    {
      question: "Do you offer support in local languages?",
      answer:
        "Yes, our team can provide support in English, Hausa, and other local languages to ensure clear communication.",
    },
  ]

  return (
    <section className="py-20 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0066E0] mb-4">Frequently Asked Questions</h2>
          <p className="text-xl text-muted-foreground">Quick answers to common questions</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index} className="p-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-[#0066E0] flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  {faq.question}
                </CardTitle>
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

function SupportOptionsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#0066E0] mb-4">Multiple Ways to Get Help</h2>
          <p className="text-xl text-muted-foreground">Choose the support option that works best for you</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle>Live Chat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Get instant help through our website chat feature</p>
              <Badge className="bg-green-100 text-green-800">Available 24/7</Badge>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle>Priority Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Premium members get priority response and dedicated support</p>
              <Badge className="bg-[#0066E0] text-white">Premium Feature</Badge>
            </CardContent>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Award className="h-12 w-12 text-[#0066E0] mx-auto mb-4" />
              <CardTitle>Video Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">Schedule one-on-one video consultations with our experts</p>
              <Badge className="bg-orange-100 text-orange-800">By Appointment</Badge>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ContactFormSection />
        <SupportOptionsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}
