"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LogOut } from "lucide-react"

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      setLoading(false)
      if (!user) {
        window.location.href = "/auth/login"
      }
    })
    return () => unsubscribe()
  }, [])

  const fakeProfile = {
    name: "Demo User",
    email: "demo@example.com",
    userId: "FAKE-USER-ID",
    level: 1,
    totalEarnings: 12345,
    referrals: 7,
  }

  const handleLogout = () => {
    auth.signOut().then(() => {
      window.location.href = "/"
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {fakeProfile.name}!</h1>
            <p className="text-gray-600">Email: {fakeProfile.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="default">ACTIVE</Badge>
              <Badge variant="outline">Level {fakeProfile.level}</Badge>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                ₦{fakeProfile.totalEarnings.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Referrals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{fakeProfile.referrals}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Level</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{fakeProfile.level}</div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {fakeProfile.name}</p>
                <p><strong>Email:</strong> {fakeProfile.email}</p>
              </div>
              <div>
                <p><strong>User ID:</strong> {fakeProfile.userId}</p>
                <p><strong>Firebase UID:</strong> FAKE-UID-123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}