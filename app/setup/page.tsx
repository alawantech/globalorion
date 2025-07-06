"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Loader2, Database, Users, Settings, Key } from "lucide-react"

export default function SetupPage() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initResult, setInitResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleInitialize = async () => {
    setIsInitializing(true)
    setError(null)
    setInitResult(null)

    try {
      const response = await fetch("/api/init")
      const data = await response.json()

      if (response.ok) {
        setInitResult(data)
      } else {
        setError(data.error || "Initialization failed")
      }
    } catch (err) {
      setError("Network error: " + (err as Error).message)
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Bright Orion MLM System Setup</h1>
          <p className="text-gray-600">Initialize your database and configure the system</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Setup Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Setup
              </CardTitle>
              <CardDescription>Initialize the database with required tables and default data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={handleInitialize} disabled={isInitializing} className="w-full" size="lg">
                {isInitializing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Initialize Database
                  </>
                )}
              </Button>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-700 text-sm">{error}</span>
                </div>
              )}

              {initResult && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-green-700 text-sm">{initResult.message}</span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Login Credentials:</h4>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-blue-900">Admin Account</span>
                        <Badge variant="secondary">Admin</Badge>
                      </div>
                      <div className="text-sm text-blue-800">
                        <div>Email: {initResult.credentials?.admin?.email}</div>
                        <div>Password: {initResult.credentials?.admin?.password}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-medium text-gray-900">Test User</span>
                        <Badge variant="outline">User</Badge>
                      </div>
                      <div className="text-sm text-gray-700">
                        <div>Email: {initResult.credentials?.testUser?.email}</div>
                        <div>Password: {initResult.credentials?.testUser?.password}</div>
                      </div>
                    </div>
                  </div>

                  <Button asChild className="w-full">
                    <a href="/auth/login">Go to Login Page</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Features Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                System Features
              </CardTitle>
              <CardDescription>What gets configured during setup</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Database tables creation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Admin user account</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">System settings configuration</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Sample activation PINs</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Commission structure</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Matrix positioning system</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Click "Initialize Database" to set up the system</p>
              <p>2. Use the provided admin credentials to log in</p>
              <p>3. Generate activation PINs for new users</p>
              <p>4. Configure system settings as needed</p>
              <p>5. Start registering users and managing the MLM network</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
