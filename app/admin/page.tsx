"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, DollarSign, TrendingUp, Settings, LogOut, Plus, Menu, Copy } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { updateDoc, doc, getDocs, query, collection, where, addDoc, Timestamp, getDoc } from "firebase/firestore"
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
  const [availablePins, setAvailablePins] = useState<{id: string, pin: string}[]>([])
  const [sentPins, setSentPins] = useState<{id: string, pin: string, sentAt: any}[]>([])
  const [usedPins, setUsedPins] = useState<{id: string, pin: string, usedBy: string, usedAt: any}[]>([])
  const [loadingPins, setLoadingPins] = useState(false)
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null)
  const [assignUserId, setAssignUserId] = useState<string>("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [withdrawals, setWithdrawals] = useState<any[]>([])

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

  // Fetch available, sent, and used pins
  const fetchPins = async () => {
    setLoadingPins(true)
    try {
      // Unused pins
      const unusedQ = query(collection(db, "pins"), where("status", "==", "unused"))
      const unusedSnap = await getDocs(unusedQ)
      setAvailablePins(unusedSnap.docs.map(docSnap => ({
        id: docSnap.id,
        pin: docSnap.data().pin
      })))
      // Sent pins
      const sentQ = query(collection(db, "pins"), where("status", "==", "sent"))
      const sentSnap = await getDocs(sentQ)
      setSentPins(sentSnap.docs.map(docSnap => ({
        id: docSnap.id,
        pin: docSnap.data().pin,
        sentAt: docSnap.data().sentAt
      })))
      // Used pins
      const usedQ = query(collection(db, "pins"), where("status", "==", "used"))
      const usedSnap = await getDocs(usedQ)
      setUsedPins(usedSnap.docs.map(docSnap => ({
        id: docSnap.id,
        pin: docSnap.data().pin,
        usedBy: docSnap.data().usedBy,
        usedAt: docSnap.data().usedAt
      })))
    } catch (error) {
      // Optionally handle error
    }
    setLoadingPins(false)
  }

  // Fetch stats and available pins after auth check
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
        // Log the error response for debugging
        const errorData = await response.json().catch(() => ({}))
        console.error("Admin stats error:", errorData)
        toast({
          title: "Error",
          description: errorData.error || "Failed to load admin statistics",
          variant: "destructive",
        })
      }
    } catch (error) {
      // Log the error for debugging
      console.error("Admin stats network error:", error)
      toast({
        title: "Error",
        description: "Network error. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      fetchPins()
      fetchWithdrawals()
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
      fetchStats() // This will refresh available pins
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

  // Mark pin as sent (checkbox)
  const markPinAsSent = async (pinId: string) => {
    try {
      await updateDoc(doc(db, "pins", pinId), {
        status: "sent",
        sentAt: Timestamp.now(),
      })
      toast({
        title: "Success",
        description: "Pin marked as sent",
      })
      fetchPins()
      fetchStats()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to mark pin as sent",
        variant: "destructive",
      })
    }
  }

  // Copy pin to clipboard and show popup
  const copyToClipboard = (pin: string) => {
    navigator.clipboard.writeText(pin)
    toast({
      title: "Copied!",
      description: `PIN ${pin} copied to clipboard.`,
      duration: 1500,
    })
  }

  // Fetch withdrawals for admin
  const fetchWithdrawals = async () => {
    const res = await fetch("/api/admin/withdrawals")
    const data = await res.json()
    setWithdrawals(data.withdrawals || [])
  }

  // Approve withdrawal
  const approveWithdrawal = async (withdrawalId: string) => {
    await fetch("/api/admin/withdrawals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId })
    })
    fetchWithdrawals()
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

  // Defensive: Provide default values if stats is undefined or missing fields
  const safeStats = {
    totalUsers: stats?.totalUsers ?? 0,
    totalEarnings: stats?.totalEarnings ?? 0,
    pendingCommissions: stats?.pendingCommissions ?? 0,
    availablePins: stats?.availablePins ?? 0,
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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              {/* Hamburger for mobile */}
              <button
                className="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 text-xs sm:text-sm">Bright Orion Management Panel</p>
              </div>
            </div>
            <Button onClick={handleLogout} variant="outline" className="hidden md:flex">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <Button onClick={handleLogout} variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
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
            </div>
          )}
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{safeStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{safeStats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Commissions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{safeStats.pendingCommissions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available PINs</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{availablePins.length}</div>
              <p className="text-xs text-muted-foreground">Ready for distribution</p>
              {loadingPins ? (
                <div className="text-xs text-gray-500 mt-2">Loading...</div>
              ) : availablePins.length > 0 ? (
                <div className="mt-4 max-h-40 overflow-y-auto">
                  <div className="font-semibold mb-2 text-xs">PINs:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availablePins.map(({id, pin}) => (
                      <label key={id} className="flex items-center gap-2 bg-gray-100 rounded px-2 py-1 font-mono text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          onChange={e => e.target.checked && markPinAsSent(id)}
                        />
                        {pin}
                        <button
                          type="button"
                          className="ml-1 p-1 rounded hover:bg-gray-200"
                          title="Copy PIN"
                          onClick={e => {
                            e.preventDefault()
                            e.stopPropagation()
                            copyToClipboard(pin)
                          }}
                        >
                          <Copy className="w-4 h-4 text-gray-500" />
                        </button>
                      </label>
                    ))}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    Check a box to mark a PIN as sent.
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 mt-2">No available PINs.</div>
              )}
            </CardContent>
          </Card>
          {/* Sent PINs section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sent PINs</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sentPins.length}</div>
              <p className="text-xs text-muted-foreground">Marked as sent</p>
              {loadingPins ? (
                <div className="text-xs text-gray-500 mt-2">Loading...</div>
              ) : sentPins.length > 0 ? (
                <div className="mt-4 max-h-40 overflow-y-auto">
                  <div className="font-semibold mb-2 text-xs">PINs:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {sentPins.map(({id, pin, sentAt}) => (
                      <div key={id} className="bg-yellow-100 rounded px-2 py-1 font-mono text-xs">
                        {pin}
                        <div className="text-[10px] text-gray-500">
                          Sent: {sentAt?.toDate?.().toLocaleString?.() || ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 mt-2">No sent PINs.</div>
              )}
            </CardContent>
          </Card>
          {/* Used PINs section */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Used PINs</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{usedPins.length}</div>
              <p className="text-xs text-muted-foreground">Used by users</p>
              {loadingPins ? (
                <div className="text-xs text-gray-500 mt-2">Loading...</div>
              ) : usedPins.length > 0 ? (
                <div className="mt-4 max-h-40 overflow-y-auto">
                  <div className="font-semibold mb-2 text-xs">PINs:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {usedPins.map(({id, pin, usedBy, usedAt}) => (
                      <div key={id} className="bg-green-100 rounded px-2 py-1 font-mono text-xs">
                        {pin}
                        <div className="text-[10px] text-gray-500">
                          Used by: {usedBy || "Unknown"}
                          <br />
                          Used: {usedAt?.toDate?.().toLocaleString?.() || ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-xs text-gray-500 mt-2">No used PINs.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Management Tools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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

        {/* Withdrawals Section */}
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <div className="font-semibold mb-2 text-gray-900">Withdrawal Requests</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead>
                <tr className="text-left text-gray-600 border-b">
                  <th className="py-2 pr-4">User ID</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Bank</th>
                  <th className="py-2 pr-4">Account No</th>
                  <th className="py-2 pr-4">Amount</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => (
                  <tr key={w.id} className="border-b last:border-0">
                    <td className="py-2 pr-4">{w.userId}</td>
                    <td className="py-2 pr-4">{w.accountName}</td>
                    <td className="py-2 pr-4">{w.bankName}</td>
                    <td className="py-2 pr-4">{w.accountNumber}</td>
                    <td className="py-2 pr-4">₦{w.amount}</td>
                    <td className="py-2 pr-4 capitalize">{w.status}</td>
                    <td className="py-2 pr-4">
                      {w.status === "pending" && (
                        <input
                          type="checkbox"
                          onChange={() => approveWithdrawal(w.id)}
                          title="Mark as approved"
                        />
                      )}
                      {w.status === "approved" && (
                        <span className="text-green-600 font-bold">Approved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}