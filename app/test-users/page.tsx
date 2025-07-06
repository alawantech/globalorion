"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface TestUser {
  email: string
  password: string
  memberId: string
  name: string
}

export default function TestUsersPage() {
  const { toast } = useToast()
  const [testUsers, setTestUsers] = useState<TestUser[]>([])
  const [loading, setLoading] = useState(false)

  const createTestUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/create-test-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const data = await response.json()

      if (data.success) {
        setTestUsers(data.users)
        toast({
          title: "Success",
          description: "Test users created successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create test users",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating test users:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loginAsUser = (email: string, password: string) => {
    // Store credentials in sessionStorage for auto-login
    sessionStorage.setItem("testLogin", JSON.stringify({ email, password }))
    window.location.href = "/auth/login"
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Test Users</h1>
          <p className="text-gray-600 mt-2">Create and manage test users for development</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Test Users</CardTitle>
            <CardDescription>Generate test users with sample data for testing the user dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={createTestUsers} disabled={loading} className="w-full">
              {loading ? "Creating Test Users..." : "Create Test Users"}
            </Button>
          </CardContent>
        </Card>

        {testUsers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Test User Accounts</CardTitle>
              <CardDescription>Click "Login as User" to test the user dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testUsers.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{user.name}</h3>
                      <p className="text-sm text-gray-600">Email: {user.email}</p>
                      <p className="text-sm text-gray-600">Password: {user.password}</p>
                      <p className="text-sm text-gray-600">Member ID: {user.memberId}</p>
                    </div>
                    <Button onClick={() => loginAsUser(user.email, user.password)} variant="outline">
                      Login as User
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Login as admin to manage the system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Admin User</h3>
                <p className="text-sm text-gray-600">Email: admin@brightorian.com</p>
                <p className="text-sm text-gray-600">Password: admin123</p>
              </div>
              <Button onClick={() => loginAsUser("admin@brightorian.com", "admin123")} variant="outline">
                Login as Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
