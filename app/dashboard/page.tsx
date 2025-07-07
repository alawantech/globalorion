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

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [referrals, setReferrals] = useState<ReferralData[]>([])
  const [notifications, setNotifications] = useState<NotificationData[]>([])
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState(false)
  const [showBalance, setShowBalance] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get Firebase ID token
          const token = await firebaseUser.getIdToken()
          
          // Fetch user profile
          await fetchUserProfile(token)
          
          // Fetch referrals
          await fetchReferrals(token)
          
          // Fetch notifications
          await fetchNotifications(token)
          
        } catch (error) {
          console.error("Error loading user data:", error)
        }
      } else {
        router.push("/auth/login")
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setStats(data.stats)
      } else {
        console.error("Failed to fetch profile")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchReferrals = async (token: string) => {
    try {
      const response = await fetch("/api/user/referrals", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setReferrals(data.referrals)
      } else {
        console.error("Failed to fetch referrals")
      }
    } catch (error) {
      console.error("Error fetching referrals:", error)
    }
  }

  const fetchNotifications = async (token: string) => {
    try {
      const response = await fetch("/api/user/notifications", {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications)
      } else {
        console.error("Failed to fetch notifications")
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    )
  }

  if (!user || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">User not found</div>
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

        {/* Stats Cards */}
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
              <div className="text-2xl font-bold">
                {showBalance ? `₦${stats.totalEarnings.toLocaleString()}` : "₦****"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalance ? `₦${stats.pendingEarnings.toLocaleString()}` : "₦****"}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Direct Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.referralsCount}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {showBalance ? `₦${stats.availableBalance.toLocaleString()}` : "₦****"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Referral Section */}
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
                      {referrals.map((referral) => (
                        <div key={referral.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{referral.referredUserName}</p>
                            <p className="text-xs text-gray-500">{referral.referredUserId}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                              {referral.status}
                            </Badge>
                            <p className="text-xs text-gray-500">
                              {showBalance ? `₦${referral.totalCommissionEarned}` : "₦****"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Recent Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No notifications yet.</p>
              ) : (
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 bg-gray-50 rounded">
                      <h5 className="font-medium text-sm">{notification.title}</h5>
                      <p className="text-xs text-gray-600">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {notification.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Account Info */}
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
              </div>
              <div>
                <p><strong>Location:</strong> {user.location || 'Not specified'}</p>
                <p><strong>User ID:</strong> {user.userId}</p>
                <p><strong>Joined:</strong> {user.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
