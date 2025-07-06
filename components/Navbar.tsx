"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Menu,
  User,
  LogOut,
  Settings,
  BarChart3,
  Home,
  Info,
  ShoppingBag,
  MapPin,
  Users,
  Phone,
  Store,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet"

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check for logged in user
    const checkAuth = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("auth-token")
        const userData = localStorage.getItem("user-data")

        if (token && userData) {
          try {
            setUser(JSON.parse(userData))
          } catch (error) {
            console.error("Error parsing user data:", error)
            localStorage.removeItem("auth-token")
            localStorage.removeItem("user-data")
          }
        }
      }
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth-token")
      localStorage.removeItem("user-data")
      setUser(null)
      router.push("/")
    }
  }

  const menuItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/about", label: "About", icon: Info },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/locations", label: "Locations", icon: MapPin },
    { href: "/team", label: "Team", icon: Users },
    { href: "/contact", label: "Contact", icon: Phone },
  ]

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo Section */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/images/bright-orion-logo.png"
                alt="Bright Orion Logo"
                fill
                className="object-contain rounded-lg"
                priority
                sizes="(max-width: 768px) 40px, 48px"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-xl md:text-2xl font-bold text-[#0066E0]">Bright Orion</span>
              <span className="text-xs text-gray-500 hidden md:block">MLM Platform</span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-700 hover:text-[#0066E0] transition-colors duration-200 font-medium"
              >
                {item.label}
              </Link>
            ))}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                    <User className="h-4 w-4 mr-2" />
                    {user.firstName || user.name || "Account"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <p className="text-xs text-blue-600">{user.memberId}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/stockist/register" className="flex items-center">
                      <Store className="h-4 w-4 mr-2" />
                      Become Stockist
                    </Link>
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="flex items-center">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className="bg-[#0066E0] hover:bg-[#00266C]" asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-3">
                    <div className="relative w-8 h-8">
                      <Image
                        src="/images/bright-orion-logo.png"
                        alt="Bright Orion Logo"
                        fill
                        className="object-contain rounded"
                        sizes="32px"
                      />
                    </div>
                    <span className="text-[#0066E0] font-bold">Bright Orion</span>
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-8 space-y-4">
                  {/* User Info Section */}
                  {user && (
                    <div className="bg-blue-50 p-4 rounded-lg mb-6">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#0066E0] rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-blue-600">{user.memberId}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Links */}
                  <div className="space-y-2">
                    {menuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-700">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>

                  {/* User Actions */}
                  {user ? (
                    <div className="space-y-2 pt-4 border-t">
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <BarChart3 className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Dashboard</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Profile Settings</span>
                      </Link>
                      <Link
                        href="/stockist/register"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Store className="h-5 w-5 text-gray-600" />
                        <span className="font-medium text-gray-700">Become Stockist</span>
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsOpen(false)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Settings className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Admin Panel</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout()
                          setIsOpen(false)
                        }}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <LogOut className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-red-600">Logout</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 pt-4 border-t">
                      <Button
                        variant="outline"
                        asChild
                        className="w-full bg-transparent"
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/auth/login">Login</Link>
                      </Button>
                      <Button
                        className="w-full bg-[#0066E0] hover:bg-[#00266C]"
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/auth/register">Register</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
