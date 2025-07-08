"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, DollarSign, TrendingUp, Settings, LogOut, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { collection, addDoc, Timestamp, getDoc, doc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function AdminPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEarnings: 0,
    pendingCommissions: 0,
    availablePins: 0,
  })
  const [pinCount, setPinCount] = useState(5)
  const [loading, setLoading] = useState(true)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [adminUid, setAdminUid] = useState<string | null>(null)
  const [generatedPins, setGeneratedPins] = useState<string[]>([])

  useEffect(() => {
    // Check if user is admin
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.replace("/auth/login")
        return
      }
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        router.replace("/dashboard")
        return
      }
      setAdminUid(firebaseUser.uid)
      setCheckingAuth(false)
      fetchStats()
    })
    return () => unsubscribe()
    // eslint-disable-next-line
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else if (response.status === 401 || response.status === 403) {
        router.push("/auth/login")
      } else {
        toast({
          title: "Error",
          description: "Failed to load admin statistics",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // --- CLIENT-SIDE PIN GENERATION ---
  const generatePins = async () => {
    if (!adminUid) {
      toast({
        title: "Error",
        description: "Admin not authenticated",
        variant: "destructive",
      })
      return
    }
    try {
      const newPins: string[] = []
      for (let i = 0; i < pinCount; i++) {
        const pinCode = generateRandomPin(8)
        await addDoc(collection(db, "pins"), {
          pin: pinCode,
          status: "unused",
          assignedTo: null,
          createdAt: Timestamp.now(),
        })
        newPins.push(pinCode)
      }
      setGeneratedPins(newPins)
      toast({
        title: "Success",
        description: `Generated ${pinCount} new PIN(s) successfully`,
      })
      fetchStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to generate PINs",
        variant: "destructive",
      })
    }
  }

  function generateRandomPin(length = 8) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    let pin = ""
    for (let i = 0; i < length; i++) {
      pin += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return pin
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      toast({
        title: "Success",
        description: "Logged out successfully",
      })
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (checkingAuth || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Bright Orion Management Panel</p>
            </div>
            <Button onClick={handleLogout} variant="outline">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.pendingCommissions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available PINs</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availablePins}</div>
              <p className="text-xs text-muted-foreground">Ready for distribution</p>
            </CardContent>
          </Card>
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>PIN Management</CardTitle>
              <CardDescription>Generate new activation PINs for users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pinCount">Number of PINs to generate</Label>
                <Input
                  id="pinCount"
                  type="number"
                  min="1"
                  max="100"
                  value={pinCount}
                  onChange={(e) => setPinCount(Number.parseInt(e.target.value) || 1)}
                />
              </div>
              <Button onClick={generatePins} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Generate PINs
              </Button>
              {generatedPins.length > 0 && (
                <div className="mt-4">
                  <div className="font-semibold mb-2">Generated PINs:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {generatedPins.map((pin, idx) => (
                      <div key={idx} className="bg-gray-100 rounded px-2 py-1 font-mono text-xs">{pin}</div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline" onClick={() => router.push("/admin/users")}>
                View All Users
              </Button>
              <Button className="w-full" variant="outline" onClick={() => router.push("/admin/commissions")}>
                Approve Commissions
              </Button>
              <Button className="w-full" variant="outline" onClick={() => router.push("/admin/withdrawals")}>
                Manage Withdrawals
              </Button>
              <Button className="w-full" variant="outline" onClick={() => router.push("/admin/settings")}>
                System Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}