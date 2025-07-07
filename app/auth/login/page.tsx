"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  // Check if user is already logged in
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is already logged in, redirect to dashboard
        router.push("/dashboard")
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: "", type: "" })

    try {
      console.log("🔐 Attempting Firebase login...")

      // Sign in with Firebase directly
      const userCredential = await signInWithEmailAndPassword(auth, formData.email.toLowerCase(), formData.password)
      const firebaseUser = userCredential.user

      console.log("✅ Firebase login successful:", firebaseUser.email)
      console.log("✅ Firebase UID:", firebaseUser.uid)
      
      setMessage({ text: "Login successful! Redirecting to dashboard...", type: "success" })

      // FORCE IMMEDIATE REDIRECT - Multiple methods to ensure it works
      console.log("🚀 Forcing redirect to dashboard...")
      
      // Method 1: Direct window.location replacement
      window.location.replace("/dashboard")
      
      // Method 2: Backup timeout redirect
      setTimeout(() => {
        console.log("🔄 Backup redirect triggered")
        window.location.href = "/dashboard"
      }, 1000)
      
      // Method 3: Another backup
      setTimeout(() => {
        console.log("🔄 Final backup redirect")
        window.open("/dashboard", "_self")
      }, 2000)

    } catch (error: any) {
      console.error("❌ Login error:", error)
      
      let errorMessage = "Login failed. Please try again."
      
      if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
        errorMessage = "Invalid email or password."
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later."
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password."
      }

      setMessage({
        text: errorMessage,
        type: "error",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">Welcome Back</CardTitle>
          <p className="text-gray-600">Sign in to your Bright Orion account</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {message.text && (
            <div
              className={`mt-4 p-3 rounded-lg text-center text-sm ${
                message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
              {message.type === "success" && (
                <div className="mt-3 space-y-2">
                  <button
                    onClick={() => {
                      console.log("🔗 Manual redirect button clicked")
                      window.location.replace("/dashboard")
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  >
                    Go to Dashboard Now
                  </button>
                  <button
                    onClick={() => {
                      console.log("🔗 Alternative redirect method")
                      window.open("/dashboard", "_self")
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                  >
                    Alternative Dashboard Link
                  </button>
                  <p className="text-xs text-gray-600">
                    Click either button above if not redirected automatically
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            <p className="font-medium text-gray-700">Demo Credentials:</p>
            <p className="text-gray-600">Use any registered email and password</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
