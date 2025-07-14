"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Users, TrendingUp, Award, LogOut, Link as LinkIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore"
import { recalculateUserCommissions } from "@/lib/referral-system"
import ReferralNetwork from "./ReferralNetwork"

interface User {
  id: string
  memberId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  status: string
  role: string
  activationDate: string
}

interface UserStats {
  totalEarnings: number
  pendingEarnings: number
  availableBalance: number
  referralsCount: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReferral, setShowReferral] = useState(false)
  const [copied, setCopied] = useState(false)
  const [checkingRole, setCheckingRole] = useState(true)
  const [recalcLoading, setRecalcLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/auth/login")
        return
      }
      // Fetch user profile from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        setUser(null)
        setStats(null)
        setLoading(false)
        setCheckingRole(false)
        return
      }
      const userData = userDoc.data()
      // If user is admin, redirect to admin dashboard
      if (userData.role === "admin") {
        router.replace("/admin")
        return
      }
      const userProfile: User = {
        id: firebaseUser.uid,
        memberId: userData.memberId || userData.userId || firebaseUser.uid,
        firstName: userData.firstName || userData.name?.split(" ")[0] || "",
        lastName: userData.lastName || userData.name?.split(" ")[1] || "",
        email: userData.email || firebaseUser.email || "",
        phone: userData.phone || "",
        status: userData.status || "active",
        role: userData.role || "user",
        activationDate: userData.activationDate || userData.createdAt?.toDate?.()?.toISOString() || "",
      }

      // Fetch stats
      let totalEarnings = 0
      let pendingEarnings = 0
      let availableBalance = 0
      let referralsCount = 0

      // Commissions
      try {
        const commissionsQuery = query(
          collection(db, "commissions"),
          where("userId", "==", userProfile.memberId)
        )
        const commissionsSnap = await getDocs(commissionsQuery)
        commissionsSnap.forEach(doc => {
          const c = doc.data()
          if (c.status === "approved") {
            totalEarnings += c.amount || 0
            availableBalance += c.amount || 0
          } else if (c.status === "pending") {
            pendingEarnings += c.amount || 0
          }
        })
      } catch {}

      // Referrals
      try {
        const referralsQuery = query(
          collection(db, "referrals"),
          where("sponsorId", "==", userProfile.memberId)
        )
        const referralsSnap = await getDocs(referralsQuery)
        referralsCount = referralsSnap.size
      } catch {}

      setUser(userProfile)
      setStats({
        totalEarnings,
        pendingEarnings,
        availableBalance,
        referralsCount,
      })
      setLoading(false)
      setCheckingRole(false)

      // Recalculate commissions for the logged-in user
      if (userProfile) {
        setRecalcLoading(true)
        recalculateUserCommissions(userProfile.memberId).then(commissions => {
          // Optionally update stats based on recalculated commissions
          setStats(prev => ({
            ...prev!,
            totalEarnings: commissions.filter(c => c.status === "approved").reduce((sum, c) => sum + (c.amount || 0), 0),
            pendingEarnings: commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + (c.amount || 0), 0),
            availableBalance: commissions.filter(c => c.status === "approved").reduce((sum, c) => sum + (c.amount || 0), 0),
          }))
          setRecalcLoading(false)
        }).catch(() => setRecalcLoading(false))
      }
    })
    return () => unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/")
  }

  // Generate referral link for the logged-in user
  const referralLink = user
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/auth/register?sponsor=${user.memberId}`
    : ""

  // Copy referral link to clipboard
  const handleCopyReferral = () => {
    if (referralLink) {
      navigator.clipboard.writeText(referralLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading || checkingRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to load dashboard</h2>
          <p className="text-gray-600 mb-4">Please try refreshing the page</p>
          <Button onClick={() => window.location.reload()}>Refresh Page</Button>
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
              <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.firstName}!</h1>
              <p className="text-gray-600">Member ID: {user.memberId}</p>
              <p className="text-sm text-gray-500">Status: {user.status}</p>
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
        {/* Show recalculation loading */}
        {recalcLoading && (
          <div className="text-blue-700 text-sm mb-4">Recalculating commissions...</div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Approved commissions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.availableBalance.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₦{stats.pendingEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.referralsCount}</div>
              <p className="text-xs text-muted-foreground">Direct referrals</p>
            </CardContent>
          </Card>
        </div>

        {/* User Info Card and Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  <p className="text-sm">
                    {user.firstName} {user.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Member ID</p>
                  <p className="text-sm">{user.memberId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-sm">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="text-sm">{user.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="text-sm capitalize">{user.status}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Activation Date</p>
                  <p className="text-sm">{user.activationDate ? new Date(user.activationDate).toLocaleDateString() : ""}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                className="w-full flex items-center gap-2"
                variant="outline"
                onClick={() => setShowReferral(!showReferral)}
              >
                <LinkIcon className="h-4 w-4" />
                Refer New Member
              </Button>
              {showReferral && (
                <div className="mt-2 p-3 bg-blue-50 rounded text-center">
                  <div className="text-xs text-gray-700 mb-2">Your Referral Link:</div>
                  <div className="flex items-center gap-2 justify-center">
                    <input
                      type="text"
                      value={referralLink}
                      readOnly
                      className="w-full px-2 py-1 text-xs border rounded bg-gray-100"
                      style={{ maxWidth: 300 }}
                    />
                    <Button size="sm" onClick={handleCopyReferral}>
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Anyone who registers with this link will have your Member ID as their sponsor.
                  </div>
                </div>
              )}
              <Button className="w-full" variant="outline">
                Request Withdrawal
              </Button>
              <Button className="w-full" variant="outline">
                View Commission History
              </Button>
              <Button className="w-full" variant="outline">
                Update Profile
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Referral Network */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Network</CardTitle>
              <CardDescription>See all your referrals (direct and indirect) and their levels</CardDescription>
            </CardHeader>
            <CardContent>
              <ReferralNetwork userId={user.memberId} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

