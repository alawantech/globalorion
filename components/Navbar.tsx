"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
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
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          console.log("🔍 Navbar: Getting user data for", firebaseUser.email)
          
          // Find user by email instead of UID
          const usersQuery = query(collection(db, "users"), where("email", "==", firebaseUser.email))
          const usersSnapshot = await getDocs(usersQuery)
          
          if (!usersSnapshot.empty) {
            const userData = usersSnapshot.docs[0].data()
            console.log("✅ Navbar: User data found", userData.name)
            setUser({
              ...userData,
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            })
          } else {
            console.log("⚠️ Navbar: No user document found")
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || "User",
              userId: "TEMP-USER"
            })
          }
        } catch (error) {
          console.error("❌ Navbar: Error fetching user data:", error)
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "User",
            userId: "ERROR-USER"
          })
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
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

  if (loading) {
    return (
      <nav className="bg-white shadow-lg sticky top-0 z-50 border-b">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-3">
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
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    )
  }

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
              <>
                {/* Become Stockist button for desktop, only for logged-in users */}
                <Button
                  variant="outline"
                  className="bg-transparent"
                  asChild
                >
                  <Link href="/stockist/register">
                    <Store className="h-4 w-4 mr-2" />
                    Become Stockist
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="ml-4 bg-transparent">
                      <User className="h-4 w-4 mr-2" />
                      {user.name || "Account"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-2 py-1.5">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-blue-600">{user.userId}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link
                        href={user.role === "admin" ? "/admin/dashboard" : "/user"}
                        className="flex items-center"
                      >
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
                    {/* Remove Become Stockist from dropdown for desktop */}
                    {/* {user.role === "admin" && ( */}
                    {user.role === "admin" && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin/dashboard" className="flex items-center">
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
              </>
            ) : (
              <div className="flex items-center space-x-3 ml-4">
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className="bg-[#0066E0] hover:bg-[#00266C]" asChild>
                  <Link href="/auth/register">Register</Link>
                </Button>
                {/* Become Stockist button removed for not-logged-in users */}
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
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                          <p className="text-xs text-blue-600">{user.userId}</p>
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
                        href={user.role === "admin" ? "/admin/dashboard" : "/user"}
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
                      {/* Dashboard fallback for not logged in */}
                      <Button
                        variant="ghost"
                        className="w-full flex items-center gap-2 justify-start"
                        asChild
                        onClick={() => setIsOpen(false)}
                      >
                        <Link href="/auth/login">
                          <BarChart3 className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-700">Dashboard</span>
                        </Link>
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
          </div>
        </div>
      </div>
    </nav>
  )
}
