"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Mail, Phone, Send, Facebook, Instagram } from "lucide-react"

// Custom Twitter X Icon Component
function TwitterXIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

// Custom Telegram Icon Component
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    {
      name: "Facebook",
      icon: <Facebook className="h-5 w-5" />,
      url: "https://facebook.com/brightorian",
      color: "hover:text-blue-600",
    },
    {
      name: "Instagram",
      icon: <Instagram className="h-5 w-5" />,
      url: "https://instagram.com/brightorian",
      color: "hover:text-pink-600",
    },
    {
      name: "Twitter X",
      icon: <TwitterXIcon className="h-5 w-5" />,
      url: "https://x.com/brightorian",
      color: "hover:text-black",
    },
    {
      name: "Telegram",
      icon: <TelegramIcon className="h-5 w-5" />,
      url: "https://t.me/brightorian",
      color: "hover:text-blue-500",
    },
  ]

  return (
    <footer className="bg-gray-900 text-white">
      {/* Newsletter Section */}
      <div className="bg-[#0066E0] py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Updated with Bright Orion</h3>
            <p className="text-blue-100 mb-6">
              Get the latest updates, success stories, and exclusive offers delivered to your inbox
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-white text-gray-900 border-0"
              />
              <Button className="bg-[#00266C] hover:bg-[#001a4d] text-white px-6">
                <Send className="h-4 w-4 mr-2" />
                Subscribe
              </Button>
            </div>
            <p className="text-xs text-blue-100 mt-3">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <Link href="/" className="text-2xl font-bold text-[#0066E0] mb-4 block">
                Bright Orion
              </Link>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Empowering individuals to achieve financial freedom through our innovative 6-level matrix system.
              </p>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h4 className="font-semibold text-white">Follow Us</h4>
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-gray-400 transition-colors ${social.color}`}
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-[#0066E0] transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-gray-300 hover:text-[#0066E0] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-[#0066E0] transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-3">
                <li>
                  <Link href="/auth/login" className="text-gray-300 hover:text-[#0066E0] transition-colors">
                    Member Login
                  </Link>
                </li>
                <li>
                  <Link href="/auth/register" className="text-gray-300 hover:text-[#0066E0] transition-colors">
                    Register Now
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contact</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-[#0066E0]" />
                  <p className="text-gray-300 text-sm">+234 803 123 4567</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-[#0066E0]" />
                  <p className="text-gray-300 text-sm">info@brightorian.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="bg-gray-700" />

      {/* Bottom Footer */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-400 text-sm">© {currentYear} Bright Orion. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
