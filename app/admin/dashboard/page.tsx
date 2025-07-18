"use client"

// This React component fetches and displays the total number of users, total earnings, and pending commissions for the admin dashboard.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, serverTimestamp, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Menu } from "lucide-react"

// Simple copy icon SVG component
function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" fill="none" viewBox="0 0 20 20">
      <rect x="6" y="6" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="3" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  )
}

// Add User interface for type safety
interface User {
  id: string
  name: string
  userId: string
  collectionId: string
  email: string
  location: string
  deliveryStatus?: {
    isProductDelivered?: boolean
    time?: any
  }
}

// Add a good field name for the object
const DELIVERY_STATUS_FIELD = "deliveryStatus"

export default function AdminDashboard() {
  // State for admin statsnpm r
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null)
  const [pendingCommissions, setPendingCommissions] = useState<number | null>(null)
  const [availablePins, setAvailablePins] = useState<any[]>([])
  const [sentPins, setSentPins] = useState<any[]>([])
  const [usedPins, setUsedPins] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Pin generation state
  const [pinCount, setPinCount] = useState<number>(1)
  const [generating, setGenerating] = useState(false)
  const [genMsg, setGenMsg] = useState<string>("")
  const [sendingPinIds, setSendingPinIds] = useState<string[]>([])
  const [copiedPin, setCopiedPin] = useState<string | null>(null)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true)
  const [withdrawalsError, setWithdrawalsError] = useState<string | null>(null)
  // Add state for users table
  const [users, setUsers] = useState<User[]>([])
  const [usersLoading, setUsersLoading] = useState(true)
  // Add search state
  const [search, setSearch] = useState("")
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [approvedWithdrawals, setApprovedWithdrawals] = useState<any[]>([])
  const [showSection, setShowSection] = useState<"withdrawals" | "users" | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Fetch admin stats from the API on mount
  useEffect(() => {
    async function fetchAdminStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" })
        const data = await res.json()
        // Log to console for debugging
        console.log("Admin stats API response:", data)
        if (res.ok && data) {
          setTotalUsers(
            typeof data.totalUsers === "number"
              ? data.totalUsers
              : Number(data.totalUsers) || 0
          )
          setTotalEarnings(
            typeof data.totalEarnings === "number"
              ? data.totalEarnings
              : Number(data.totalEarnings) || 0
          )
          setPendingCommissions(
            typeof data.pendingCommissions === "number"
              ? data.pendingCommissions
              : Number(data.pendingCommissions) || 0
          )
          setAvailablePins(Array.isArray(data.availablePinsList) ? data.availablePinsList : [])
          setSentPins(Array.isArray(data.sentPinsList) ? data.sentPinsList : [])
          setUsedPins(Array.isArray(data.usedPinsList) ? data.usedPinsList : [])
        } else {
          setError(data?.error || "Failed to fetch stats")
        }
      } catch (e: any) {
        setError("Failed to fetch stats")
      }
      setLoading(false)
    }
    fetchAdminStats()
  }, [])

  // Fetch withdrawals on mount
  useEffect(() => {
    async function fetchWithdrawals() {
      setWithdrawalsLoading(true)
      setWithdrawalsError(null)
      try {
        // Fetch all users
        const usersSnap = await getDocs(collection(db, "users"))
        // Pending withdrawals
        const withdrawalUsers = usersSnap.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
          .filter(u => typeof u.requestedWithdrawals === "number" && u.requestedWithdrawals > 0)
        const withdrawalsList = withdrawalUsers.map(u => ({
          id: u.id,
          userId: u.userId || u.id,
          name: u.name || u.fullName || "",
          email: u.email || "",
          bankName: u.bankName || "",
          accountNumber: u.accountNumber || "",
          accountName: u.accountName || "",
          amount: u.requestedWithdrawals,
          status: "pending",
          requestedAt: u.updatedAt?.toDate?.() || u.updatedAt || null,
        }))
        setWithdrawals(withdrawalsList)

        // --- DEBUG: Log all commissions for admin to see why approved withdrawals may be missing ---
        usersSnap.docs.forEach(docSnap => {
          const user = docSnap.data()
          if (Array.isArray(user.commissions)) {
            user.commissions.forEach((c: any) => {
              // eslint-disable-next-line no-console
              console.log("Commission for user", user.userId || docSnap.id, c)
            })
          }
        })

        // Approved withdrawals: show all commissions with approved === true and approvedAt
        const approvedList: any[] = []
        usersSnap.docs.forEach(docSnap => {
          const user = docSnap.data()
          if (Array.isArray(user.commissions)) {
            user.commissions.forEach((c: any) => {
              // Accept both boolean and string "true" for approved, and check approvedAt is a number or string
              if (
                (c.approved === true || c.approved === "true") &&
                c.approvedAt &&
                c.amount > 0
              ) {
                approvedList.push({
                  id: docSnap.id,
                  userId: user.userId || docSnap.id,
                  name: user.name || user.fullName || "",
                  email: user.email || "",
                  bankName: user.bankName || "",
                  accountNumber: user.accountNumber || "",
                  accountName: user.accountName || "",
                  amount: c.amount || 0,
                  approvedAt: c.approvedAt,
                  commissionId: c.id || undefined,
                })
              }
            })
          }
        })
        // Sort by approvedAt descending (latest first)
        approvedList.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0))
        setApprovedWithdrawals(approvedList)
      } catch (e: any) {
        setWithdrawalsError("Failed to fetch withdrawals")
      }
      setWithdrawalsLoading(false)
    }
    fetchWithdrawals()
  }, [])

  // Fetch all users on mount (change to real-time listener)
  useEffect(() => {
    // Import onSnapshot from firebase/firestore
    // ...existing code...
    const unsub = onSnapshot(collection(db, "users"), (usersSnap) => {
      const usersList: User[] = usersSnap.docs.map(doc => {
        const d = doc.data()
        return {
          id: doc.id,
          name: d.name || "",
          userId: d.userId || "",
          collectionId: d.collectionId || "",
          email: d.email || "",
          location: d.location || "",
          deliveryStatus: d.deliveryStatus || {},
        }
      })
      setUsers(usersList)
      setUsersLoading(false)
      // Live stats calculation
      setTotalUsers(usersList.length)
      let earnings = 0
      let pending = 0
      usersSnap.docs.forEach(doc => {
        const d = doc.data()
        if (Array.isArray(d.commissions)) {
          d.commissions.forEach((c: any) => {
            if (c.approved === true || c.approved === "true") earnings += Number(c.amount) || 0
            else if (c.status === "requested" || c.requested) pending += Number(c.amount) || 0
          })
        }
      })
      setTotalEarnings(earnings)
      setPendingCommissions(pending)
    })
    return () => unsub()
  }, [])

  // --- LIVE WITHDRAWALS & APPROVED WITHDRAWALS ---
  useEffect(() => {
    setWithdrawalsLoading(true)
    setWithdrawalsError(null)
    const unsub = onSnapshot(collection(db, "users"), (usersSnap) => {
      // Pending withdrawals
      const withdrawalUsers = usersSnap.docs
        .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
        .filter(u => typeof u.requestedWithdrawals === "number" && u.requestedWithdrawals > 0)
      const withdrawalsList = withdrawalUsers.map(u => ({
        id: u.id,
        userId: u.userId || u.id,
        name: u.name || u.fullName || "",
        email: u.email || "",
        bankName: u.bankName || "",
        accountNumber: u.accountNumber || "",
        accountName: u.accountName || "",
        amount: u.requestedWithdrawals,
        status: "pending",
        requestedAt: u.updatedAt?.toDate?.() || u.updatedAt || null,
      }))
      setWithdrawals(withdrawalsList)
      // Approved withdrawals
      const approvedList: any[] = []
      usersSnap.docs.forEach(docSnap => {
        const user = docSnap.data()
        if (Array.isArray(user.commissions)) {
          user.commissions.forEach((c: any) => {
            if (
              (c.approved === true || c.approved === "true") &&
              c.approvedAt &&
              c.amount > 0
            ) {
              approvedList.push({
                id: docSnap.id,
                userId: user.userId || docSnap.id,
                name: user.name || user.fullName || "",
                email: user.email || "",
                bankName: user.bankName || "",
                accountNumber: user.accountNumber || "",
                accountName: user.accountName || "",
                amount: c.amount || 0,
                approvedAt: c.approvedAt,
                commissionId: c.id || undefined,
              })
            }
          })
        }
      })
      approvedList.sort((a, b) => (b.approvedAt || 0) - (a.approvedAt || 0))
      setApprovedWithdrawals(approvedList)
      setWithdrawalsLoading(false)
    }, () => setWithdrawalsError("Failed to fetch withdrawals"))
    return () => unsub()
  }, [])

  // --- LIVE PINS ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "pins"), (pinsSnap) => {
      const pins = pinsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAvailablePins(pins.filter(p => !p.usedBy && !p.sentAt))
      setSentPins(pins.filter(p => p.sentAt && !p.usedBy))
      setUsedPins(pins.filter(p => p.usedBy))
    })
    return () => unsub()
  }, [])

  // Generate PIN handler
  async function handleGeneratePins() {
    setGenerating(true)
    setGenMsg("")
    try {
      const res = await fetch("/api/admin/generate-pins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: pinCount }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setGenMsg(`Generated ${data.generated} PIN(s)`)
        // Optionally, refresh pins
        setTimeout(() => window.location.reload(), 1000)
      } else {
        setGenMsg(data.error || "Failed to generate PINs")
      }
    } catch {
      setGenMsg("Failed to generate PINs")
    }
    setGenerating(false)
  }

  // Mark PIN as sent (move from available to sent)
  async function handleSendPin(pinId: string) {
    setSendingPinIds(prev => [...prev, pinId])
    try {
      const res = await fetch("/api/admin/mark-pin-sent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinId }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        // Move pin from availablePins to sentPins in UI
        setAvailablePins(prev => prev.filter(pin => pin.id !== pinId))
        const sentPin = availablePins.find(pin => pin.id === pinId)
        if (sentPin) setSentPins(prev => [{ ...sentPin, status: "sent" }, ...prev])
      }
    } catch {}
    setSendingPinIds(prev => prev.filter(id => id !== pinId))
  }

  // Copy to clipboard handler
  function handleCopyPin(pinValue: string) {
    navigator.clipboard.writeText(pinValue)
    setCopiedPin(pinValue)
    setTimeout(() => setCopiedPin(null), 1200)
  }

  // Logout handler (assuming Firebase Auth)
  async function handleLogout() {
    if (typeof window !== "undefined") {
      try {
        const { signOut } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")
        await signOut(auth)
      } catch {}
      window.location.href = "/auth/login"
    }
  }

  // Handler for checkbox change
  async function handleDeliveryStatusCheck(user: User) {
    if (!user.id) return
    setUpdatingUserId(user.id)
    try {
      await updateDoc(doc(db, "users", user.id), {
        [DELIVERY_STATUS_FIELD]: {
          isProductDelivered: true,
          time: serverTimestamp(),
        },
      })
      // Optionally update UI to reflect change
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id
            ? { ...u, [DELIVERY_STATUS_FIELD]: { isProductDelivered: true, time: new Date() } }
            : u
        )
      )
    } catch (e) {
      // Optionally handle error
    }
    setUpdatingUserId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100">
        <span className="text-lg text-blue-700 font-semibold animate-pulse">Loading admin dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <span className="text-red-600 text-lg font-semibold">{error}</span>
      </div>
    )
  }

  // Show a warning if the API returned null/undefined for any value
  const showWarning =
    totalUsers === null || totalEarnings === null || pendingCommissions === null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      {/* Admin Header with Logout */}
      <header className="flex justify-between items-center max-w-5xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            className="p-2 rounded hover:bg-blue-100 focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open menu"
          >
            <Menu className="h-7 w-7 text-blue-700" />
          </button>
          <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
        </div>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-800"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
      {/* Hamburger Menu (always visible for all screen sizes) */}
      {mobileMenuOpen && (
        <div className="bg-white/95 border-t border-blue-100 px-4 pb-4 space-y-2 z-30">
          <div className="flex flex-col gap-2 mt-4">
            <button
              className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 font-semibold text-blue-900"
              onClick={() => { setShowSection("withdrawals"); setMobileMenuOpen(false) }}
            >
              Withdrawal Requests
              {withdrawals.length > 0 && (
                <span className="ml-2 inline-block bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs font-bold">
                  {withdrawals.length}
                </span>
              )}
            </button>
            <button
              className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 font-semibold text-blue-900"
              onClick={() => { setShowSection("users"); setMobileMenuOpen(false) }}
            >
              All Users
            </button>
            <button
              className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 font-semibold text-red-700"
              onClick={handleLogout}
            >
              Logout
            </button>
            <button
              className="w-full text-left py-2 px-3 rounded hover:bg-blue-50 font-semibold"
              onClick={() => {
                setShowSection(null)
                setMobileMenuOpen(false)
              }}
            >
              Dashboard Home
            </button>
          </div>
        </div>
      )}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* PIN Generation Section and Stats Cards */}
        {showSection === null && (
          <>
            {/* PIN Generation Section */}
            <div className="mb-8 flex flex-col sm:flex-row items-center gap-4">
              <label className="font-semibold text-blue-900">
                Number of PINs to generate:
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={pinCount}
                  onChange={e => setPinCount(Math.max(1, Number(e.target.value)))}
                  className="ml-2 px-2 py-1 border rounded w-20"
                  disabled={generating}
                />
              </label>
              <button
                className="bg-blue-700 text-white px-4 py-2 rounded shadow font-semibold hover:bg-blue-900"
                onClick={handleGeneratePins}
                disabled={generating}
              >
                {generating ? "Generating..." : "Generate PINs"}
              </button>
              {genMsg && (
                <span className={`ml-4 text-sm ${genMsg.includes("Failed") ? "text-red-600" : "text-green-700"}`}>
                  {genMsg}
                </span>
              )}
            </div>
            {showWarning && (
              <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
                Warning: Some stats could not be loaded. Please check your API and data.
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8">
              {/* Total Users */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-100">
                <div className="text-gray-500 text-sm mb-2">Total Users</div>
                <div className="text-3xl font-bold text-blue-700">
                  {totalUsers !== null ? totalUsers : "—"}
                </div>
                <div className="text-xs text-green-600 mt-2">+12% from last month</div>
              </div>
              {/* Total Earnings */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-green-100">
                <div className="text-gray-500 text-sm mb-2">Total Earnings</div>
                <div className="text-3xl font-bold text-green-700">
                  {totalEarnings !== null ? `₦${totalEarnings.toLocaleString()}` : "—"}
                </div>
                <div className="text-xs text-green-600 mt-2">+8% from last month</div>
              </div>
              {/* Pending Commissions */}
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-yellow-100">
                <div className="text-gray-500 text-sm mb-2">Pending Commissions</div>
                <div className="text-3xl font-bold text-yellow-700">
                  {pendingCommissions !== null ? `₦${pendingCommissions.toLocaleString()}` : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-2">Awaiting approval</div>
              </div>
            </div>
            {/* Withdrawal Requests Count Card */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow p-6 flex flex-col items-center border border-blue-200">
                <div className="text-gray-500 text-sm mb-2">Withdrawal Requests</div>
                <div className="text-3xl font-bold text-blue-700">
                  {withdrawals.length}
                </div>
                <div className="text-xs text-blue-600 mt-2">Pending requests</div>
              </div>
            </div>

            {/* PINs Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              {/* Available PINs */}
              <div className="bg-white rounded-xl shadow p-6 border border-orange-100">
                <div className="text-lg font-bold text-orange-700 mb-2">Available PINs</div>
                <div className="text-2xl font-bold mb-2">{availablePins.length}</div>
                <div className="text-xs text-gray-500 mb-2">Ready for distribution</div>
                <div className="max-h-40 overflow-y-auto text-xs font-mono">
                  {availablePins.length > 0 ? (
                    availablePins.map((pin, idx) => (
                      <div key={pin.id || idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={false}
                          disabled={sendingPinIds.includes(pin.id)}
                          onChange={() => handleSendPin(pin.id)}
                          aria-label="Mark as sent"
                        />
                        <span>{pin.code || pin.pin || pin.id}</span>
                        <button
                          className="ml-1 text-gray-500 hover:text-blue-700"
                          title="Copy PIN"
                          onClick={() => handleCopyPin(pin.code || pin.pin || pin.id)}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          <CopyIcon />
                        </button>
                        {copiedPin === (pin.code || pin.pin || pin.id) && (
                          <span className="ml-1 text-green-600 text-xs">Copied!</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No available PINs</div>
                  )}
                </div>
              </div>
              {/* Sent PINs */}
              <div className="bg-white rounded-xl shadow p-6 border border-blue-100">
                <div className="text-lg font-bold text-blue-700 mb-2">Sent PINs</div>
                <div className="text-2xl font-bold mb-2">{sentPins.length}</div>
                <div className="text-xs text-gray-500 mb-2">Marked as sent</div>
                <div className="max-h-40 overflow-y-auto text-xs font-mono">
                  {sentPins.length > 0 ? (
                    sentPins.map((pin, idx) => (
                      <div key={pin.id || idx} className="flex items-center gap-2">
                        <span>{pin.code || pin.pin || pin.id}</span>
                        <button
                          className="ml-1 text-gray-500 hover:text-blue-700"
                          title="Copy PIN"
                          onClick={() => handleCopyPin(pin.code || pin.pin || pin.id)}
                          style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
                        >
                          <CopyIcon />
                        </button>
                        {copiedPin === (pin.code || pin.pin || pin.id) && (
                          <span className="ml-1 text-green-600 text-xs">Copied!</span>
                        )}
                        {pin.sentAt && (
                          <span className="ml-2 text-gray-400">Sent: {new Date(pin.sentAt.seconds ? pin.sentAt.seconds * 1000 : pin.sentAt).toLocaleString()}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No sent PINs</div>
                  )}
                </div>
              </div>
              {/* Used PINs */}
              <div className="bg-white rounded-xl shadow p-6 border border-green-100">
                <div className="text-lg font-bold text-green-700 mb-2">Used PINs</div>
                <div className="text-2xl font-bold mb-2">{usedPins.length}</div>
                <div className="text-xs text-gray-500 mb-2">Used by users</div>
                <div className="max-h-40 overflow-y-auto text-xs font-mono">
                  {usedPins.length > 0 ? (
                    usedPins.map((pin, idx) => (
                      <div key={pin.id || idx}>
                        {pin.code || pin.pin || pin.id}
                        {pin.usedBy && (
                          <span className="ml-2 text-gray-400">Used by: {pin.usedBy}</span>
                        )}
                        {pin.usedAt && (
                          <span className="ml-2 text-gray-400">Used: {new Date(pin.usedAt.seconds ? pin.usedAt.seconds * 1000 : pin.usedAt).toLocaleString()}</span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400">No used PINs</div>
                  )}
                </div>
              </div>
            </div>
            {/* Withdrawals and Users Table buttons for desktop */}
            {/* <div className="hidden md:flex gap-4 mb-8"> ... </div> */}
          </>
        )}

        {/* Withdrawals Section - Full Page */}
        {showSection === "withdrawals" && (
          <div className="w-full">
            <button
              className="mb-4 px-4 py-2 rounded bg-blue-100 text-blue-900 font-semibold"
              onClick={() => setShowSection(null)}
            >
              ← Back to Dashboard
            </button>
            <div className="mb-12">
              <h2 className="text-xl font-bold text-blue-900 mb-4">Withdrawal Requests</h2>
              {withdrawalsLoading ? (
                <div className="text-blue-700">Loading withdrawal requests...</div>
              ) : withdrawalsError ? (
                <div className="text-red-600">{withdrawalsError}</div>
              ) : withdrawals.length === 0 ? (
                <div className="text-gray-500">No withdrawal requests found.</div>
              ) : (
                <>
                  {/* Table for desktop/laptop */}
                  <div className="hidden md:block">
                    <table className="w-full bg-white rounded shadow text-xs md:text-base border border-blue-400 min-w-[800px]">
                      <thead>
                        <tr className="bg-blue-50">
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">User ID</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Name</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Email</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Requested Amount</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Net Amount (after 10%)</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Bank Name</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Account Number</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Account Name</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Status</th>
                          <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Requested At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {withdrawals.map((w, idx) => (
                          <tr key={w.id || idx} className="border-b border-blue-300 last:border-none">
                            <td className="px-2 py-2 font-mono border border-blue-300 whitespace-normal break-words">{w.userId}</td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">{w.name || "—"}</td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">{w.email || "—"}</td>
                            <td className="px-2 py-2 font-semibold text-blue-900 border border-blue-300 whitespace-normal break-words">
                              ₦{Number(w.amount).toLocaleString()}
                            </td>
                            <td className="px-2 py-2 font-semibold text-green-900 border border-blue-300 whitespace-normal break-words">
                              ₦{Math.floor(Number(w.amount) * 0.9).toLocaleString()}
                            </td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">{w.bankName}</td>
                            <td className="px-2 py-2 font-mono border border-blue-300 whitespace-normal break-words">{w.accountNumber}</td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">{w.accountName}</td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">
                              {w.status === "pending" ? (
                                <button
                                  className="bg-green-600 text-white px-3 py-1 rounded text-xs md:text-base hover:bg-green-800"
                                  onClick={async () => {
                                    try {
                                      // Fetch user doc to get commissions
                                      const userRef = doc(db, "users", w.id)
                                      const userSnap = await getDocs(collection(db, "users"))
                                      const userDoc = userSnap.docs.find(d => d.id === w.id)
                                      let commissions = []
                                      if (userDoc) {
                                        commissions = Array.isArray(userDoc.data().commissions)
                                          ? userDoc.data().commissions
                                          : []
                                      }
                                      // Approve all requested commissions
                                      const updatedComms = commissions.map((c: any) =>
                                        (c.status === "requested" || c.requested)
                                          ? { 
                                              ...c, 
                                              status: "approved", 
                                              requested: false, 
                                              approved: true, // set approved: true when admin approves
                                              approvedAt: c.approvedAt || Date.now() // add approvedAt if not present
                                            }
                                          : c
                                      )
                                      await updateDoc(userRef, {
                                        requestedWithdrawals: 0,
                                        commissions: updatedComms,
                                      })
                                      setWithdrawals(prev =>
                                        prev.map(item =>
                                          item.id === w.id
                                            ? { ...item, status: "approved", amount: 0 }
                                            : item
                                        )
                                      )
                                    } catch (err) {
                                      alert("Failed to approve withdrawal")
                                    }
                                  }}
                                >
                                  Approve
                                </button>
                              ) : (
                                <span className="text-green-700 font-semibold">Approved</span>
                              )}
                            </td>
                            <td className="px-2 py-2 border border-blue-300 whitespace-normal break-words">
                              {w.requestedAt
                                ? (w.requestedAt instanceof Date
                                    ? w.requestedAt.toLocaleString()
                                    : typeof w.requestedAt.toDate === "function"
                                      ? w.requestedAt.toDate().toLocaleString()
                                      : w.requestedAt)
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Cards for mobile/tablet/small screens */}
                  <div className="md:hidden grid grid-cols-1 gap-4 mt-4">
                    {withdrawals.map((w, idx) => (
                      <div
                        key={w.id || idx}
                        className="rounded-lg border border-blue-200 bg-white shadow p-3 text-xs sm:text-sm"
                        style={{
                          fontSize: '80%',
                          maxWidth: '100vw',
                          boxSizing: 'border-box',
                        }}
                      >
                        <div className="flex justify-between mb-1">
                          <span className="font-semibold text-blue-900 text-base">{w.name || "—"}</span>
                          <span className="font-mono text-gray-500">{w.userId}</span>
                        </div>
                        <div className="mb-1 text-gray-700">{w.email || "—"}</div>
                        <div className="mb-1">
                          <span className="font-semibold">Requested:</span>{" "}
                          <span className="text-blue-900 font-bold text-base">₦{Number(w.amount).toLocaleString()}</span>
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Net (after 10%):</span>{" "}
                          <span className="text-green-900 font-bold text-base">₦{Math.floor(Number(w.amount) * 0.9).toLocaleString()}</span>
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Bank:</span> {w.bankName}
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Account No:</span> <span className="font-mono">{w.accountNumber}</span>
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Account Name:</span> {w.accountName}
                        </div>
                        <div className="mb-1">
                          <span className="font-semibold">Status:</span>{" "}
                          {w.status === "pending" ? (
                            <button
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-800"
                              onClick={async () => {
                                try {
                                  // Fetch user doc to get commissions
                                  const userRef = doc(db, "users", w.id)
                                  const userSnap = await getDocs(collection(db, "users"))
                                  const userDoc = userSnap.docs.find(d => d.id === w.id)
                                  let commissions = []
                                  if (userDoc) {
                                    commissions = Array.isArray(userDoc.data().commissions)
                                      ? userDoc.data().commissions
                                      : []
                                  }
                                  // Approve all requested commissions
                                  const updatedComms = commissions.map((c: any) =>
                                    (c.status === "requested" || c.requested)
                                      ? { 
                                          ...c, 
                                          status: "approved", 
                                          requested: false, 
                                          approved: true, // set approved: true when admin approves
                                          approvedAt: c.approvedAt || Date.now() // add approvedAt if not present
                                        }
                                      : c
                                  )
                                  await updateDoc(userRef, {
                                    requestedWithdrawals: 0,
                                    commissions: updatedComms,
                                  })
                                  setWithdrawals(prev =>
                                    prev.map(item =>
                                      item.id === w.id
                                        ? { ...item, status: "approved", amount: 0 }
                                        : item
                                    )
                                  )
                                } catch (err) {
                                  alert("Failed to approve withdrawal")
                                }
                              }}
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-green-700 font-semibold">Approved</span>
                          )}
                        </div>
                        <div className="mb-1 text-gray-500">
                          <span className="font-semibold">Requested At:</span>{" "}
                          {w.requestedAt
                            ? (w.requestedAt instanceof Date
                                ? w.requestedAt.toLocaleString()
                                : typeof w.requestedAt.toDate === "function"
                                  ? w.requestedAt.toDate().toLocaleString()
                                  : w.requestedAt)
                            : "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            {/* --- Approved Commissions Section --- */}
            <div className="mb-12">
              <h2 className="text-xl font-bold text-green-900 mb-4">Approved Withdrawals</h2>
              {/* Search bar for approved withdrawals */}
              <div className="mb-4 flex items-center">
                <input
                  type="text"
                  placeholder="Search by name, email, or user ID"
                  className="w-full max-w-md px-3 py-2 border border-green-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Group and sum approved withdrawals by approvedAt */}
              {(() => {
                // Filter by search
                const filtered = approvedWithdrawals.filter(w => {
                  const q = search.trim().toLowerCase()
                  if (!q) return true
                  return (
                    (w.name || "").toLowerCase().includes(q) ||
                    (w.email || "").toLowerCase().includes(q) ||
                    (w.userId || "").toLowerCase().includes(q)
                  )
                })
                // Group by approvedAt (use string date for grouping)
                const groups: Record<string, { approvedAt: any, total: number, items: any[] }> = {}
                filtered.forEach(w => {
                  let key = ""
                  if (typeof w.approvedAt === "number") {
                    key = new Date(w.approvedAt).toLocaleString()
                  } else if (w.approvedAt?.toDate) {
                    key = w.approvedAt.toDate().toLocaleString()
                  } else {
                    key = String(w.approvedAt)
                  }
                  if (!groups[key]) {
                    groups[key] = { approvedAt: w.approvedAt, total: 0, items: [] }
                  }
                  groups[key].total += Number(w.amount) || 0
                  groups[key].items.push(w)
                })
                const groupList = Object.entries(groups)
                  .sort((a, b) => {
                    // Sort by approvedAt descending
                    const aTime = a[1].items[0]?.approvedAt
                    const bTime = b[1].items[0]?.approvedAt
                    const aNum = typeof aTime === "number" ? aTime : aTime?.toDate?.()?.getTime?.() || 0
                    const bNum = typeof bTime === "number" ? bTime : bTime?.toDate?.()?.getTime?.() || 0
                    return bNum - aNum
                  })
                if (groupList.length === 0) {
                  return <div className="text-gray-500">No approved withdrawals found.</div>
                }
                // Calculate total sum for all groups
                const totalApprovedSum = groupList.reduce((sum, [, group]) => sum + group.total, 0)
                // Show each group as a single row/card with summed amount
                return (
                  <>
                    {/* Table for desktop/laptop */}
                    <div className="hidden md:block">
                      <table className="w-full bg-white rounded shadow text-xs md:text-base border border-green-400">
                        <thead>
                          <tr className="bg-green-50">
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">Approved At</th>
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">Total Amount</th>
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">User(s)</th>
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">Email(s)</th>
                            <th className="px-2 py-2 text-left border border-green-400 font-semibold">Count</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupList.map(([key, group], idx) => (
                            <tr key={key + idx} className="border-b border-green-300 last:border-none">
                              <td className="px-2 py-2 border border-green-300 whitespace-normal break-words">{key}</td>
                              <td className="px-2 py-2 border border-green-300 font-semibold text-green-900 whitespace-normal break-words">
                                ₦{group.total.toLocaleString()}
                              </td>
                              <td className="px-2 py-2 border border-green-300 whitespace-normal break-words">
                                {/* Show unique users for this group */}
                                {Array.from(new Set(group.items.map(i => `${i.userId} - ${i.name}`))).join(", ")}
                              </td>
                              <td className="px-2 py-2 border border-green-300 whitespace-normal break-words">
                                {/* Show unique emails for this group */}
                                {Array.from(new Set(group.items.map(i => i.email))).join(", ")}
                              </td>
                              <td className="px-2 py-2 border border-green-300 whitespace-normal break-words">
                                {group.items.length}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {/* Cards for mobile/tablet/small screens */}
                    <div className="md:hidden grid grid-cols-1 gap-4">
                      {groupList.map(([key, group], idx) => (
                        <div
                          key={key + idx}
                          className="rounded-lg border border-green-300 bg-white shadow p-3 text-xs sm:text-sm"
                          style={{
                            fontSize: '80%',
                            maxWidth: '100vw',
                            boxSizing: 'border-box',
                          }}
                        >
                          <div className="mb-1">
                            <span className="font-semibold">Approved At:</span>{" "}
                            {key}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">Total Amount:</span>{" "}
                            <span className="text-green-900 font-bold text-base">₦{group.total.toLocaleString()}</span>
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">User(s):</span>{" "}
                            {Array.from(new Set(group.items.map(i => `${i.userId} - ${i.name}`))).join(", ")}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">Email(s):</span>{" "}
                            {Array.from(new Set(group.items.map(i => i.email))).join(", ")}
                          </div>
                          <div className="mb-1">
                            <span className="font-semibold">Count:</span> {group.items.length}
                          </div>
                        </div>
                      ))}
                    </div>
                    {/* Show total approved sum below the table/cards */}
                    <div className="mt-4 text-lg font-bold text-green-900">
                      Total Approved Amount: ₦{totalApprovedSum.toLocaleString()}
                    </div>
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {/* Users Table Section - Full Page */}
        {showSection === "users" && (
          <div className="w-full">
            <button
              className="mb-4 px-4 py-2 rounded bg-blue-100 text-blue-900 font-semibold"
              onClick={() => setShowSection(null)}
            >
              ← Back to Dashboard
            </button>
            <div className="max-w-5xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-6">All Users</h2>
              {/* Search Bar */}
              <div className="mb-4 flex items-center">
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, email, user ID, or collection ID"
                  className="w-full max-w-md px-3 py-2 border border-blue-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              {usersLoading ? (
                <div className="p-8 text-center">Loading users...</div>
              ) : (
                <div className="w-full overflow-x-auto">
                  <table className="min-w-full border-2 border-blue-400 rounded text-sm sm:text-base">
                    <thead>
                      <tr>
                        <th className="border-2 border-blue-400 px-2 py-1">Name</th>
                        <th className="border-2 border-blue-400 px-2 py-1">User ID</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Collection ID</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Email</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Location</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Select</th>
                        <th className="border-2 border-blue-400 px-2 py-1">Product Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(u => (
                        <tr key={u.id}>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.name}</td>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.userId}</td>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.collectionId}</td>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.email}</td>
                          <td className="border-2 border-blue-400 px-2 py-1">{u.location}</td>
                          <td className="border-2 border-blue-400 px-2 py-1 text-center">
                            <input
                              type="checkbox"
                              checked={!!u.deliveryStatus?.isProductDelivered}
                              disabled={!!u.deliveryStatus?.isProductDelivered || updatingUserId === u.id}
                              onChange={() => handleDeliveryStatusCheck(u)}
                            />
                          </td>
                          <td className="border-2 border-blue-400 px-2 py-1 text-center">
                            {u.deliveryStatus?.isProductDelivered
                              ? <span className="text-green-700 font-semibold">Collected</span>
                              : <span className="text-gray-500">Not Collected</span>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ...existing code... */}
      </main>
    </div>
  )
}

// This file is being rendered as a page component, but Next.js 13/14 app directory routing requires the filename to be page.tsx for a route.
// To fix the 404 error, rename this file from dashboard.tsx to page.tsx inside the folder e:\Globalorion\app\admin\dashboard\

/*
Move this file to:
e:\Globalorion\app\admin\dashboard\page.tsx

So the structure should be:
e:\Globalorion\app\admin\dashboard\page.tsx
*/

// No code changes needed, just rename the file as described above.

// No code changes needed in this file for your error.
// To fix the build error:
// Delete one of the conflicting files:
//   - If you are using the new app router (recommended for Next.js 13+):
//     Delete: pages/api/admin/stats.ts
//   - If you want to use the old pages router:
//     Delete: app/api/admin/stats/route.ts
// You cannot have both for the same route. Pick one and remove the other.
// Then re-deploy.