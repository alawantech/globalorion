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
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
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
  const [showForgot, setShowForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotMsg, setForgotMsg] = useState({ text: "", type: "" })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage({ text: "", type: "" })

    try {
      console.log("🔐 Attempting Firebase login...")

      const userCredential = await signInWithEmailAndPassword(auth, formData.email.toLowerCase(), formData.password)
      const firebaseUser = userCredential.user

      console.log("✅ Firebase login successful:", firebaseUser.email)
      setMessage({ text: "Login successful! Redirecting to dashboard...", type: "success" })

      // Immediately redirect to dashboard after login
      router.push("/user")
      // Or use: window.location.replace("/dashboard")
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

  // Forgot password handler
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotMsg({ text: "", type: "" })
    if (!forgotEmail) {
      setForgotMsg({ text: "Please enter your email address.", type: "error" })
      return
    }
    try {
      await sendPasswordResetEmail(auth, forgotEmail.toLowerCase())
      setForgotMsg({ text: "Password reset email sent! Check your inbox.", type: "success" })
    } catch (error: any) {
      let msg = "Failed to send reset email."
      if (error.code === "auth/user-not-found") msg = "No user found with that email."
      setForgotMsg({ text: msg, type: "error" })
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
            </div>
          )}

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
                Register here
              </Link>
            </p>
            {/* Forgot Password Link */}
            <button
              type="button"
              className="mt-2 text-blue-600 hover:underline text-sm"
              onClick={() => { setShowForgot(true); setForgotMsg({ text: "", type: "" }); setForgotEmail(""); }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Forgot Password Modal */}
          {showForgot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto p-6 relative">
                <button
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
                  onClick={() => setShowForgot(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <h2 className="text-lg font-bold mb-4 text-blue-700">Reset Password</h2>
                <form onSubmit={handleForgotPassword} className="space-y-3">
                  <input
                    type="email"
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Enter the email you registered with"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    required
                  />
                  <div className="text-xs text-gray-500 mb-2">
                    Please enter the <b>email address you used to register</b> your account.
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Send Reset Email
                  </Button>
                </form>
                {forgotMsg.text && (
                  <div className={`mt-3 text-sm ${forgotMsg.type === "success" ? "text-green-700" : "text-red-700"}`}>
                    {forgotMsg.text}
                    {forgotMsg.type === "success" && (
                      <div className="mt-2 text-xs text-gray-600">
                        Please check your <b>inbox</b> and <b>spam/junk folder</b> for the password reset link.
                      </div>
                    )}
                  </div>
                )}
                {/* Resend link if email was sent */}
                {forgotMsg.type === "success" && (
                  <div className="mt-4 text-center text-xs text-gray-600">
                    Didn't receive the email?{" "}
                    <button
                      type="button"
                      className="text-blue-600 hover:underline"
                      onClick={e => handleForgotPassword(e as any)}
                    >
                      Resend
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm">
            
          </div>
        </CardContent>
      </Card>
    </div>
  )
}