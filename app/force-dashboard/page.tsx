"use client"

import { useState, useEffect } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Gift, Bell, Copy, Share2, Eye, EyeOff, LogOut } from "lucide-react"

export default function ForceDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log("🔥 Force Dashboard loaded")
    
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      console.log("🔥 Auth state:", firebaseUser?.email || "No user")
      
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || "User",
          userId: "FORCE-USER-123"
        })
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLogout = async () => {
    try {
      await signOut(auth)
      window.location.href = "/"
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading Force Dashboard...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Not Authenticated</h2>
          <p className="mb-4">Please login first</p>
          <button
            onClick={() => window.location.href = "/auth/login"}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">🚀 Force Dashboard - {user.name}!</h1>
            <p className="text-gray-600">Email: {user.email}</p>
            <p className="text-gray-600">UID: {user.uid}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">ACTIVE</Badge>
              <Badge variant="outline">Level 1</Badge>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">₦0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Pending Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">₦0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Direct Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Available Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">₦0</div>
            </CardContent>
          </Card>
        </div>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>✅ Dashboard Status:</strong> FORCE LOADED SUCCESSFULLY</p>
              <p><strong>🔑 Firebase Auth:</strong> {user.email}</p>
              <p><strong>🆔 User UID:</strong> {user.uid}</p>
              <p><strong>📍 Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
              <p><strong>🌐 Origin:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
            </div>
            
            <div className="mt-4 space-x-2">
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Try Normal Dashboard
              </button>
              <button
                onClick={() => window.location.href = "/redirect-test"}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Test Redirects
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Reload Page
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Referral Link */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?sponsor=${user.userId}`}
                readOnly
                className="flex-1 p-2 text-sm bg-gray-100 border rounded"
              />
              <Button size="sm" onClick={() => {
                const link = `${window.location.origin}/auth/register?sponsor=${user.userId}`
                navigator.clipboard.writeText(link)
                alert('Copied!')
              }}>
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
