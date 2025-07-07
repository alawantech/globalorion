"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, DollarSign, Gift, Bell, Copy, Share2, Eye, EyeOff, LogOut } from "lucide-react"

interface UserData {
  uid: string
  userId: string
  name: string
  email: string
  phone: string
  status: string
  role: string
  currentLevel: number
  createdAt: any
  activationDate: any
  location: string
  sponsorId?: string
  uplineId?: string
}

interface UserStats {
  totalEarnings: number
  pendingEarnings: number
  availableBalance: number
  referralsCount: number
}

interface ReferralData {
  id: string
  sponsorId: string
  referredUserId: string
  referredUserName: string
  referredUserEmail: string
  level: number
  status: string
  totalCommissionEarned: number
  joinedAt: any
  activatedAt: any
}

interface NotificationData {
  id: string
  userId: string
  title: string
  message: string
  type: string
  isRead: boolean
  createdAt: any
}

interface CommissionData {
  id: string
  amount: number
  status: string
  level: number
  note?: string
  createdAt: string
  approvedAt?: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [referrals, setReferrals] = useState<ReferralData[]>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [commissions, setCommissions] = useState<CommissionData[]>([])
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showBalance, setShowBalance] = useState(false)

  useEffect(() => {
    let mounted = true

    console.log("🔥 Dashboard useEffect started")

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("🔥 Dashboard auth state changed:", firebaseUser?.email || "No user")
      
      if (firebaseUser && mounted) {
        try {
          console.log("🔑 User authenticated, UID:", firebaseUser.uid)
          console.log("🔑 User email:", firebaseUser.email)
          
          const token = await firebaseUser.getIdToken(true)
          console.log("🎫 Token obtained successfully")
          
          console.log("📡 Starting to fetch all user data...")
          
          // Fetch all user data with error handling
          const promises = [
            fetchUserProfile(token).catch(err => {
              console.error("Profile fetch failed:", err)
              return null
            }),
            fetchReferrals(token).catch(err => {
              console.error("Referrals fetch failed:", err)
              return null
            }),
            fetchNotifications(token).catch(err => {
              console.error("Notifications fetch failed:", err)
              return null
            }),
            fetchCommissions(token).catch(err => {
              console.error("Commissions fetch failed:", err)
              return null
            })
          ]
          
          await Promise.allSettled(promises)
          console.log("✅ All data fetch operations completed")
          
        } catch (error) {
          console.error("❌ Error in auth state handler:", error)
        }
      } else if (!firebaseUser && mounted) {
        console.log("❌ No authenticated user found")
        // Don't redirect immediately, wait a bit for auth to settle
        setTimeout(() => {
          if (!auth.currentUser && mounted) {
            console.log("❌ Still no user after timeout, redirecting to login")
            router.push("/auth/login")
          }
        }, 2000)
      }
      
      if (mounted) {
        setLoading(false)
      }
    })

    return () => {
      console.log("🧹 Dashboard cleanup")
      mounted = false
      unsubscribe()
    }
  }, [router])

  const fetchUserProfile = async (token: string) => {
    try {
      console.log("📡 Fetching user profile...")
      const response = await fetch("/api/user/profile", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Profile data received:", data)
        setUser(data.user)
        setStats(data.stats)
      } else {
        console.error("❌ Failed to fetch profile")
      }
    } catch (error) {
      console.error("❌ Error fetching profile:", error)
    }
  }

  const fetchReferrals = async (token: string) => {
    try {
      console.log("📡 Fetching referrals...")
      const response = await fetch("/api/user/referrals", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Referrals data received:", data)
        setReferrals(data.referrals || [])
      } else {
        console.error("❌ Failed to fetch referrals")
        setReferrals([])
      }
    } catch (error) {
      console.error("❌ Error fetching referrals:", error)
      setReferrals([])
    }
  }

  const fetchNotifications = async (token: string) => {
    try {
      console.log("📡 Fetching notifications...")
      const response = await fetch("/api/user/notifications", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Notifications data received:", data)
        setNotifications(data.notifications || [])
      } else {
        console.error("❌ Failed to fetch notifications")
        setNotifications([])
      }
    } catch (error) {
      console.error("❌ Error fetching notifications:", error)
      setNotifications([])
    }
  }

  const fetchCommissions = async (token: string) => {
    try {
      console.log("📡 Fetching commissions...")
      const response = await fetch("/api/user/commissions", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Commissions data received:", data)
        setCommissions(data.commissions || [])
      } else {
        console.error("❌ Failed to fetch commissions")
        setCommissions([])
      }
    } catch (error) {
      console.error("❌ Error fetching commissions:", error)
      setCommissions([])
    }
  }

  const copyReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/register?sponsor=${user?.userId}`
    navigator.clipboard.writeText(referralLink)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}/auth/register?sponsor=${user?.userId}`
    const message = `Join Bright Orion MLM and start earning! Use my referral link: ${referralLink}`
    
    if (navigator.share) {
      navigator.share({
        title: 'Join Bright Orion',
        text: message,
        url: referralLink
      })
    } else {
      // Fallback to WhatsApp
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
          <p className="mt-2 text-xs text-gray-400">Fetching real data from Firebase...</p>
          <div className="mt-4 text-xs text-gray-500">
            <p>Auth User: {auth.currentUser?.email || 'None'}</p>
            <p>Auth UID: {auth.currentUser?.uid || 'None'}</p>
            <p>Loading State: {loading.toString()}</p>
          </div>
          <div className="mt-4 space-y-2">
            <button
              onClick={() => {
                console.log("🔄 Force refresh button clicked")
                window.location.reload()
              }}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Force Refresh
            </button>
            <button
              onClick={() => {
                console.log("🔄 Manual dashboard navigation")
                window.location.href = "/dashboard"
              }}
              className="bg-green-500 text-white px-4 py-2 rounded ml-2"
            >
              Manual Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Check if we have at least user data
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading User Profile</h2>
          <p className="text-gray-600 mb-4">Please wait while we load your profile data...</p>
          <div className="space-y-2">
            <Button onClick={() => window.location.reload()} className="w-full">
              Refresh Page
            </Button>
            <Button 
              onClick={() => {
                auth.signOut().then(() => router.push("/auth/login"))
              }} 
              variant="outline" 
              className="w-full"
            >
              Login Again
            </Button>
          </div>
          <div className="mt-4 text-xs text-gray-500 bg-gray-100 p-3 rounded">
            <p>Debug Info:</p>
            <p>Auth User: {auth.currentUser?.email || 'None'}</p>
            <p>User Data: {user ? 'Loaded' : 'Not loaded'}</p>
            <p>Stats Data: {stats ? 'Loaded' : 'Not loaded'}</p>
          </div>
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
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user.name}!</h1>
            <p className="text-gray-600">User ID: {user.userId}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status.toUpperCase()}
              </Badge>
              <Badge variant="outline">Level {user.currentLevel}</Badge>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Stats Cards - Now showing real Firebase data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBalance(!showBalance)}
                  className="h-6 w-6 p-0"
                >
                  {showBalance ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {showBalance ? `₦${(stats?.totalEarnings || 0).toLocaleString()}` : "₦****"}
              </div>
              <p className="text-xs text-muted-foreground">
                From {commissions.filter((c: CommissionData) => c.status === 'approved').length} approved commissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {showBalance ? `₦${(stats?.pendingEarnings || 0).toLocaleString()}` : "₦****"}
              </div>
              <p className="text-xs text-muted-foreground">
                From {commissions.filter((c: CommissionData) => c.status === 'pending').length} pending commissions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Direct Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.referralsCount || 0}</div>
              <p className="text-xs text-muted-foreground">
                {referrals.filter(r => r.status === 'active').length} active referrals
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {showBalance ? `₦${(stats?.availableBalance || 0).toLocaleString()}` : "₦****"}
              </div>
              <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Section - Now showing real referrals data */}
          <Card>
            <CardHeader>
              <CardTitle>Referral System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Your Referral Link:</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/register?sponsor=${user.userId}`}
                      readOnly
                      className="flex-1 p-2 text-sm bg-gray-100 border rounded"
                    />
                    <Button size="sm" onClick={copyReferralLink}>
                      <Copy className="h-4 w-4" />
                      {copySuccess ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button size="sm" onClick={shareReferralLink}>
                      <Share2 className="h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Your Referrals ({referrals.length})</h4>
                  {referrals.length === 0 ? (
                    <p className="text-gray-500 text-sm">No referrals yet. Start sharing your link!</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {referrals.slice(0, 5).map((referral) => (
                        <div key={referral.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{referral.referredUserName}</p>
                            <p className="text-xs text-gray-500">{referral.referredUserId}</p>
                            <p className="text-xs text-gray-400">Joined: {referral.joinedAt}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                              {referral.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">
                              Level {referral.level}
                            </p>
                            {showBalance && (
                              <p className="text-xs text-green-600">
                                ₦{(referral.totalCommissionEarned || 0).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                      {referrals.length > 5 && (
                        <p className="text-xs text-center text-gray-500 mt-2">
                          And {referrals.length - 5} more referrals...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications - Now showing real notifications data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications ({notifications.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No notifications yet.</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {notifications.slice(0, 5).map((notification) => (
                    <div key={notification.id} className={`p-3 rounded ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{notification.title}</h5>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{notification.createdAt}</p>
                        </div>
                        <Badge variant={notification.type === 'system' ? 'secondary' : 'default'} className="text-xs">
                          {notification.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {notifications.length > 5 && (
                    <p className="text-xs text-center text-gray-500 mt-2">
                      And {notifications.length - 5} more notifications...
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Commission History */}
        {commissions.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Commission History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {commissions.slice(0, 10).map((commission: CommissionData) => (
                  <div key={commission.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">₦{commission.amount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-600">{commission.note || `Level ${commission.level} commission`}</p>
                      <p className="text-xs text-gray-400">Created: {commission.createdAt}</p>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={commission.status === 'approved' ? 'default' : commission.status === 'pending' ? 'secondary' : 'destructive'}
                      >
                        {commission.status}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">Level {commission.level}</p>
                      {commission.approvedAt && (
                        <p className="text-xs text-green-600">Approved: {commission.approvedAt}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Info - Now showing real user data */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Name:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone}</p>
                <p><strong>Location:</strong> {user.location || 'Not specified'}</p>
              </div>
              <div>
                <p><strong>User ID:</strong> {user.userId}</p>
                <p><strong>Sponsor ID:</strong> {user.sponsorId || 'None'}</p>
                <p><strong>Upline ID:</strong> {user.uplineId || 'None'}</p>
                <p><strong>Joined:</strong> {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
                <p><strong>Activated:</strong> {user.activationDate?.toDate?.()?.toLocaleDateString() || 'Not activated'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
