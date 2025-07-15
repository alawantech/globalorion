"use client"

import { useEffect, useState } from "react"
import { Menu, LogOut, User, BarChart3, Settings, Users, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { calculateMatrixRequirements } from "@/lib/matrix-calculator"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { recalculateUserCommissions } from "@/lib/referral-system"
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Add this helper component at the top (after imports):
function SimpleModal({ open, onClose, children }: { open: boolean, onClose: () => void, children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto p-6 relative">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  )
}

// Helper to fetch user doc by firebaseUid or userId
async function fetchCurrentUserDoc(firebaseUid: string) {
  // Try userId field first
  let q = query(collection(db, "users"), where("userId", "==", firebaseUid))
  let snap = await getDocs(q)
  if (!snap.empty) return snap.docs[0].data()

  // Try by firebaseUid field
  const q2 = query(collection(db, "users"), where("firebaseUid", "==", firebaseUid))
  const snap2 = await getDocs(q2)
  if (!snap2.empty) return snap2.docs[0].data()

  // Try by doc ID (could be Firebase UID)
  const docSnap = await getDoc(doc(db, "users", firebaseUid))
  if (docSnap.exists()) return docSnap.data()

  return null
}

export default function UserDashboard({ userId }: { userId: string }) {
  // User and dashboard state
  const [user, setUser] = useState<any>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const [downlines, setDownlines] = useState<any[]>([])
  const [commissions, setCommissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Bank details modal state
  const [showBankDialog, setShowBankDialog] = useState(false)
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [accountName, setAccountName] = useState("")
  const [bankMsg, setBankMsg] = useState("")
  const [savingBank, setSavingBank] = useState(false)

  // Add a new state for requested withdrawals
  const [requestedWithdrawals, setRequestedWithdrawals] = useState<number>(0)
  const [recalcLoading, setRecalcLoading] = useState(false)
  const [commissionBranches, setCommissionBranches] = useState<any[]>([])

  const router = useRouter()

  // Fetch user and dashboard data on auth state change
  useEffect(() => {
    if (typeof window === "undefined") return
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser?.uid) {
        setLoading(true)
        setError(null)
        try {
          // Get Firebase token for secure API requests
          const token = await firebaseUser.getIdToken()
          // --- FETCH USER DOC BY firebaseUid OR USERID ---
          const userData = await fetchCurrentUserDoc(firebaseUser.uid)
          if (!userData) throw new Error("User not found")
          setUser(userData)
          // Use embedded referrals and commissions arrays from user doc
          setReferrals(Array.isArray(userData.referrals) ? userData.referrals : [])
          setCommissions(Array.isArray(userData.commissions) ? userData.commissions : [])
          // Fetch downlines (matrix) from API
          const downRes = await fetch(`/api/user/downlines?userId=${userData.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const downData = await downRes.json()
          setDownlines(Array.isArray(downData.downlines) ? downData.downlines : [])
        } catch (e: any) {
          setError(e.message || "Failed to load user data")
        }
        setLoading(false)
      } else {
        setUser(null)
        setLoading(false)
      }
    })
    return () => unsubscribe()
  }, [])

  // Load bank details from user doc into modal state when user data changes
  useEffect(() => {
    if (user) {
      setBankName(user.bankName || "")
      setAccountNumber(user.accountNumber || "")
      setAccountName(user.accountName || "")
    }
  }, [user])

  // Load requestedWithdrawals from user doc if present
  useEffect(() => {
    if (user && typeof user.requestedWithdrawals === "number") {
      setRequestedWithdrawals(user.requestedWithdrawals)
    }
  }, [user])

  // Redirect admin users to admin dashboard
  useEffect(() => {
    if (user && (user.role === "admin" || user.isAdmin)) {
      router.replace("/admin/dashboard")
    }
  }, [user, router])

  // Recalculate commissions on dashboard load for current user
  useEffect(() => {
    if (user?.userId) {
      setRecalcLoading(true)
      recalculateUserCommissions(user.userId).then(branches => {
        setCommissionBranches(branches)
        // Also flatten all commissions for legacy UI
        const allComms = branches.flatMap((b: any) => b.commissions)
        setCommissions(allComms)
        setRecalcLoading(false)
      }).catch(() => setRecalcLoading(false))
    }
  }, [user?.userId])

  // Matrix and earnings calculations
  const matrixLevels = calculateMatrixRequirements()
  const referralsPerLevel: Record<number, number> = {}
  referrals.forEach(r => {
    if (r.level) referralsPerLevel[r.level] = (referralsPerLevel[r.level] || 0) + 1
  })
  // Update pendingEarnings calculation to subtract requestedWithdrawals
  const totalEarnings = commissions.filter(c => c.status === "approved").reduce((sum, c) => sum + (c.amount || 0), 0)
  const rawPendingEarnings = commissions.filter(c => c.status === "pending").reduce((sum, c) => sum + (c.amount || 0), 0)
  const pendingEarnings = Math.max(0, rawPendingEarnings - requestedWithdrawals)

  // Save bank details to Firestore via API
  const handleSaveBankDetails = async () => {
    setSavingBank(true)
    setBankMsg("")
    if (!bankName || !accountNumber || !accountName) {
      setBankMsg("All fields are required")
      setSavingBank(false)
      return
    }
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch("/api/user/update-bank", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.userId || user.uid, // fallback to user.uid if userId is missing
          bankName,
          accountNumber,
          accountName,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setBankMsg("Bank details saved!")
        // Update user state with new bank details
        setUser((prev: any) => ({
          ...prev,
          bankName,
          accountNumber,
          accountName,
        }))
        setShowBankDialog(false)
      } else {
        setBankMsg(data.error || "Failed to save bank details")
      }
      setSavingBank(false)
    } catch {
      setBankMsg("Failed to save bank details")
      setSavingBank(false)
    }
  }

  // Handle withdrawal request: move money from pending to requestedWithdrawals
  const handleRequestWithdrawal = async () => {
    if (!hasBankDetails) {
      setShowBankDialog(true)
      return
    }
    if (pendingEarnings < 5000) return

    const amount = pendingEarnings
    try {
      const token = await auth.currentUser?.getIdToken()
      // Use the correct API route and check for 404/500 errors
      const res = await fetch("/api/user/request-withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.userId || user.uid,
          amount,
        }),
      })

      // If the response is not JSON, show a generic error
      let data: any = {}
      try {
        data = await res.json()
      } catch {
        // If not JSON, show a clearer error
        alert("Withdrawal API route not found or server error. Please ensure /api/user/request-withdrawal exists and returns JSON.")
        return
      }

      if (res.ok && data.success) {
        setRequestedWithdrawals(prev => prev + amount)
        setBankMsg("")
        alert("Withdrawal request submitted!")
      } else {
        alert(data.error || "Failed to request withdrawal")
      }
    } catch (err: any) {
      alert("Failed to request withdrawal: " + (err?.message || "Unknown error"))
    }
  }

  // Helper to check if user has saved all bank details
  const hasBankDetails = !!(user?.bankName && user?.accountNumber && user?.accountName)

  // Add logout handler for user dashboard
  const handleLogout = async () => {
    try {
      await auth.signOut()
    } catch {}
    window.location.href = "/auth/login"
  }

  // Loading and error UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent"></div>
          <span className="text-lg text-blue-700 font-semibold animate-pulse">Loading user dashboard...</span>
        </div>
      </div>
    )
  }
  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <span className="text-red-600 text-lg font-semibold">{error || "No user data found."}</span>
      </div>
    )
  }

  // Main dashboard UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with hamburger menu and logout */}
      <header className="bg-white/90 shadow-sm sticky top-0 z-20 border-b border-blue-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden p-2 rounded hover:bg-blue-100 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              <Menu className="h-7 w-7 text-blue-700" />
            </button>
            <span className="text-xl sm:text-2xl font-bold text-[#0066E0] tracking-tight">User Dashboard</span>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" className="flex items-center gap-2 text-blue-700 font-semibold">
              <User className="h-5 w-5" />
              {user.name || user.fullName}
            </Button>
            <Button variant="outline" className="flex items-center gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
        {/* Mobile Hamburger Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 border-t border-blue-100 px-4 pb-4 space-y-2 z-30">
            <div className="flex flex-col gap-2 mt-4">
              {/* User info for mobile/tablet */}
              <div className="mb-4 space-y-1">
                <div className="font-bold text-blue-900">{user.name || user.fullName}</div>
                <div className="text-gray-700 text-sm">{user.email}</div>
                {user.collectionId && (
                  <div className="text-blue-700 text-xs">
                    <span className="font-semibold">Order Collection ID:</span>{" "}
                    <span className="font-mono">{user.collectionId}</span>
                  </div>
                )}
                <div className="text-gray-500 text-xs">User ID: {user.userId || user.memberId}</div>
              </div>
              <Button variant="ghost" className="w-full flex items-center gap-2 justify-start">
                <BarChart3 className="h-5 w-5" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full flex items-center gap-2 justify-start">
                <Settings className="h-5 w-5" />
                Profile Settings
              </Button>
              <Button variant="ghost" className="w-full flex items-center gap-2 justify-start">
                <Users className="h-5 w-5" />
                My Referrals
              </Button>
              <Button variant="ghost" className="w-full flex items-center gap-2 justify-start">
                <Store className="h-5 w-5" />
                Become Stockist
              </Button>
              <Button
                variant="outline"
                className="w-full flex items-center gap-2 justify-start text-red-600 border-red-200"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-3xl mx-auto px-2 sm:px-4 py-8">
        {/* --- Product Delivered Banner --- */}
        {user?.deliveryStatus?.isProductDelivered && (
          <div className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300 flex items-center gap-3">
            <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-green-800 font-semibold">
              Your product has been delivered!
              {user.deliveryStatus.time && (
                <span className="ml-2 text-green-700 text-xs">
                  {typeof user.deliveryStatus.time?.toDate === "function"
                    ? `(${user.deliveryStatus.time.toDate().toLocaleString()})`
                    : ""}
                </span>
              )}
            </span>
          </div>
        )}
        {/* User Info, Earnings, and Withdraw/Bank Details */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Hide user info on mobile/tablet, show only on desktop or when menu open */}
            <div className={`transition-all duration-200 ${mobileMenuOpen ? "block" : "hidden"} md:block`}>
              <h2 className="text-2xl font-bold text-[#0066E0] mb-1">{user.name || user.fullName}</h2>
              <div className="text-gray-700 mb-1">{user.email}</div>
              {/* Improved label for collectionId */}
              {user.collectionId && (
                <div className="text-blue-700 text-sm mb-1">
                  <span className="font-semibold">Order Collection ID:</span>{" "}
                  <span className="font-mono">{user.collectionId}</span>
                  <span className="text-xs text-gray-500 ml-2">(Show this ID to collect your package/order)</span>
                </div>
              )}
              <div className="text-gray-500 text-xs mb-1">User ID: {user.userId || user.memberId}</div>
              {/* Withdraw Button */}
              <div className="mt-4 flex flex-col gap-2">
                <Button
                  className="bg-[#0066E0] hover:bg-[#00266C] text-white font-semibold px-6 py-2 rounded-lg shadow"
                  disabled={pendingEarnings < 5000}
                  onClick={handleRequestWithdrawal}
                >
                  Request Withdrawal
                </Button>
                {pendingEarnings < 5000 && (
                  <div className="text-xs text-red-600 mt-2">
                    Pending earnings must be at least ₦5,000 to request withdrawal.
                  </div>
                )}
                {/* Edit Bank Details Button */}
                <Button
                  variant="outline"
                  className="w-fit mt-2"
                  onClick={() => setShowBankDialog(true)}
                >
                  {hasBankDetails ? "Edit Bank Details" : "Add Bank Details"}
                </Button>
              </div>
              {/* Display current bank details if present */}
              {(user.bankName || user.accountNumber || user.accountName) && (
                <div className="mt-4 bg-blue-50 rounded p-3 text-sm text-blue-900">
                  <div><span className="font-semibold">Bank Name:</span> {user.bankName}</div>
                  <div><span className="font-semibold">Account Number:</span> {user.accountNumber}</div>
                  <div><span className="font-semibold">Account Name:</span> {user.accountName}</div>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="bg-blue-50 rounded-lg px-4 py-2 text-center">
                <div className="text-xs text-gray-500">Total Earnings</div>
                <div className="text-lg font-bold text-green-700">
                  ₦{totalEarnings.toLocaleString()}
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg px-4 py-2 text-center">
                <div className="text-xs text-gray-500">Pending Earnings</div>
                <div className="text-lg font-bold text-yellow-700">
                  ₦{pendingEarnings.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex-1 min-w-[120px] bg-blue-50 rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-gray-500">Direct Referrals</div>
              <div className="text-lg font-bold">{referrals.length}</div>
            </div>
            <div className="flex-1 min-w-[120px] bg-purple-50 rounded-lg px-4 py-2 text-center">
              <div className="text-xs text-gray-500">Matrix Downlines</div>
              <div className="text-lg font-bold">{downlines.length}</div>
            </div>
            {/* Requested Withdrawals Section */}
            <div className="flex-1 min-w-[120px] bg-orange-50 rounded-lg px-4 py-2 text-center border border-orange-200 shadow">
              <div className="text-xs text-orange-700 font-semibold">Requested Withdrawals</div>
              <div className="text-lg font-bold text-orange-700">
                ₦{requestedWithdrawals.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Awaiting admin approval
              </div>
            </div>
          </div>
        </div>

        {/* Show recalculation loading */}
        {recalcLoading && (
          <div className="text-blue-700 text-sm mb-4">Recalculating commissions...</div>
        )}

        {/* Direct Referrals Table */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 border border-blue-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-[#0066E0]">Direct Referrals</h3>
          {referrals.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-blue-50">
                  <th className="py-2 px-2 text-left">Name</th>
                  <th className="py-2 px-2 text-left">Member ID</th>
                  <th className="py-2 px-2 text-left">Level</th>
                  <th className="py-2 px-2 text-left">To Complete Level</th>
                  <th className="py-2 px-2 text-left">Remaining for Level</th>
                  <th className="py-2 px-2 text-left">Matrix Level</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, i) => {
                  const levelConfig = matrixLevels.find(l => l.level === r.level)
                  const needed = levelConfig
                    ? Math.max(0, levelConfig.requiredMembers - (referralsPerLevel[r.level] || 0))
                    : "-"
                  // Calculate how many more referrals this referral needs to complete their own level
                  const theirLevelConfig = matrixLevels.find(l => l.level === r.level)
                  // Count how many referrals this referral has at their level
                  const theirDirects = referrals.filter(ref => ref.sponsorId === r.referredUserId && ref.level === r.level).length
                  const theirNeeded = theirLevelConfig
                    ? Math.max(0, theirLevelConfig.requiredMembers - theirDirects)
                    : "-"
                  // Find which matrix level this referral is in for you
                  let matrixLevel = 1
                  let parentId = r.sponsorId
                  let currentId = r.referredUserId
                  while (parentId !== user.userId && matrixLevel < 6) {
                    // Find parent referral
                    const parentRef = referrals.find(ref => ref.referredUserId === parentId)
                    if (!parentRef) break
                    parentId = parentRef.sponsorId
                    matrixLevel++
                  }
                  return (
                    <tr key={i} className="even:bg-blue-50/40">
                      <td className="py-2 px-2">{r.referredUserName || r.name}</td>
                      <td className="py-2 px-2">{r.referredUserId || r.memberId}</td>
                      <td className="py-2 px-2">{r.level}</td>
                      <td className="py-2 px-2">{needed}</td>
                      <td className="py-2 px-2">{theirNeeded}</td>
                      <td className="py-2 px-2">{matrixLevel}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : (
            <div className="text-gray-500">No referrals yet.</div>
          )}
        </div>

        {/* Matrix Progress Table */}
        <div className="bg-white rounded-xl shadow p-6 mb-8 border border-blue-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-[#0066E0]">Matrix Progress</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-blue-50">
                <th className="py-2 px-2 text-left">Level</th>
                <th className="py-2 px-2 text-left">Required</th>
                <th className="py-2 px-2 text-left">Directs</th>
                <th className="py-2 px-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {matrixLevels.map(level => (
                <tr key={level.level} className="even:bg-blue-50/40">
                  <td className="py-2 px-2">{level.level}</td>
                  <td className="py-2 px-2">{level.requiredMembers}</td>
                  <td className="py-2 px-2">{referralsPerLevel[level.level] || 0}</td>
                  <td className="py-2 px-2">
                    {(referralsPerLevel[level.level] || 0) >= level.requiredMembers
                      ? <span className="text-green-600 font-bold">Complete</span>
                      : <span className="text-yellow-600">In Progress</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Commissions Table */}
        <div className="bg-white rounded-xl shadow p-6 border border-blue-100 overflow-x-auto">
          <h3 className="text-lg font-semibold mb-4 text-[#0066E0]">Commissions</h3>
          {commissionBranches.length > 0 ? (
            <div className="space-y-8">
              {commissionBranches.map((branch, idx) => (
                <div key={idx} className="mb-6 border-b pb-4">
                  <div className="font-semibold text-blue-800 mb-2">
                    Direct Referral: {branch.directReferral.referredUserName || branch.directReferral.name} ({branch.directReferral.referredUserId})
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    Branch: {branch.branch.map((r: any) => r.referredUserName || r.name || r.referredUserId).join(" → ")}
                  </div>
                  {/* Show all users at each level if there are multiple */}
                  <table className="w-full text-sm mb-2">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="py-2 px-2 text-left">Level</th>
                        <th className="py-2 px-2 text-left">User(s)</th>
                        <th className="py-2 px-2 text-left">Amount</th>
                        <th className="py-2 px-2 text-left">Status</th>
                        <th className="py-2 px-2 text-left">Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1,2,3,4,5,6].map(lvl => {
                        const levelComms = branch.commissions.filter((c: any) => c.level === lvl);
                        if (levelComms.length === 0) return null;
                        return levelComms.map((c: any, i: number) => (
                          <tr key={i} className="even:bg-blue-50/40">
                            <td className="py-2 px-2">{c.level ?? "-"}</td>
                            <td className="py-2 px-2">{c.levelName} ({c.levelId})</td>
                            <td className="py-2 px-2">₦{c.amount?.toLocaleString?.() ?? 0}</td>
                            <td className="py-2 px-2">{c.status}</td>
                            <td className="py-2 px-2">{c.description}</td>
                          </tr>
                        ));
                      })}
                    </tbody>
                  </table>
                  <div className="text-right font-bold text-green-700">
                    Total for this branch: ₦{branch.total.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No commissions yet.</div>
          )}
        </div>
      </main>
      {/* Bank Details Modal */}
      <SimpleModal open={showBankDialog} onClose={() => setShowBankDialog(false)}>
        {/* ...existing modal content (Dialog.Title, form, etc.)... */}
        <div className="text-lg font-bold mb-4 text-[#0066E0]">
          {user.bankName && user.accountNumber && user.accountName ? "Edit Bank Details" : "Add Bank Details"}
        </div>
        <div className="space-y-3">
          {/* Bank Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={bankName}
              onChange={e => setBankName(e.target.value)}
              placeholder="Enter bank name"
            />
          </div>
          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={accountNumber}
              onChange={e => setAccountNumber(e.target.value)}
              placeholder="Enter account number"
            />
          </div>
          {/* Account Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Account Name</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={accountName}
              onChange={e => setAccountName(e.target.value)}
              placeholder="Enter account name"
            />
          </div>
          {/* Success/Error message */}
          {bankMsg && (
            <div className={`text-sm mt-2 ${bankMsg.includes("saved") ? "text-green-600" : "text-red-600"}`}>
              {bankMsg}
            </div>
          )}
          {/* Save/Cancel buttons */}
          <div className="flex gap-3 mt-4">
            <Button
              className="bg-[#0066E0] text-white px-4 py-2 rounded"
              onClick={handleSaveBankDetails}
              disabled={savingBank}
            >
              {savingBank ? "Saving..." : "Save Bank Details"}
            </Button>
            <Button
              variant="outline"
              className="px-4 py-2 rounded"
              onClick={() => setShowBankDialog(false)}
              disabled={savingBank}
            >
              Cancel
            </Button>
          </div>
        </div>
      </SimpleModal>
      {/* ...existing code... */}
      {/* Global background style */}
      <style jsx global>{`
        body {
          background: linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%);
        }
      `}</style>
    </div>
  )
}


