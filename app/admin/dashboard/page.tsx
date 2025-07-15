"use client"

// This React component fetches and displays the total number of users, total earnings, and pending commissions for the admin dashboard.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"

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
        // Fetch all users with requestedWithdrawals > 0
        const usersSnap = await getDocs(collection(db, "users"))
        const withdrawalUsers = usersSnap.docs
          .map(docSnap => ({ id: docSnap.id, ...docSnap.data() }))
          .filter(u => typeof u.requestedWithdrawals === "number" && u.requestedWithdrawals > 0)

        // Map to withdrawal-like objects for display
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
      } catch (e: any) {
        setWithdrawalsError("Failed to fetch withdrawals")
      }
      setWithdrawalsLoading(false)
    }
    fetchWithdrawals()
  }, [])

  // Fetch all users on mount
  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersSnap = await getDocs(collection(db, "users"))
        const usersList: User[] = usersSnap.docs.map(doc => {
          const d = doc.data()
          return {
            id: doc.id,
            name: d.name || "",
            userId: d.userId || "",
            collectionId: d.collectionId || "",
            email: d.email || "",
            location: d.location || "",
          }
        })
        setUsers(usersList)
      } finally {
        setUsersLoading(false)
      }
    }
    fetchUsers()
  }, [])

  // Filter users by search (email, id, name, collectionId)
  const filteredUsers = users.filter(u => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (
      u.name.toLowerCase().includes(q) ||
      u.userId.toLowerCase().includes(q) ||
      u.collectionId.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    )
  })

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
        <h1 className="text-2xl font-bold text-blue-900">Admin Dashboard</h1>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded font-semibold hover:bg-red-800"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-12">
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

        {/* Withdrawals Section */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Withdrawal Requests</h2>
          {withdrawalsLoading ? (
            <div className="text-blue-700">Loading withdrawal requests...</div>
          ) : withdrawalsError ? (
            <div className="text-red-600">{withdrawalsError}</div>
          ) : withdrawals.length === 0 ? (
            <div className="text-gray-500">No withdrawal requests found.</div>
          ) : (
            <div className="w-full">
              <table className="w-full bg-white rounded shadow text-xs border border-blue-400">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="px-2 py-2 text-left border border-blue-400 font-semibold">User ID</th>
                    <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Name</th>
                    <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Email</th>
                    <th className="px-2 py-2 text-left border border-blue-400 font-semibold">Amount</th>
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
                      <td className="px-2 py-2 font-mono break-words truncate max-w-[120px] border border-blue-300">{w.userId}</td>
                      <td className="px-2 py-2 break-words truncate max-w-[120px] border border-blue-300">{w.name || "—"}</td>
                      <td className="px-2 py-2 break-words truncate max-w-[160px] border border-blue-300">{w.email || "—"}</td>
                      <td className="px-2 py-2 font-semibold text-blue-900 border border-blue-300">₦{Number(w.amount).toLocaleString()}</td>
                      <td className="px-2 py-2 break-words truncate max-w-[100px] border border-blue-300">{w.bankName}</td>
                      <td className="px-2 py-2 font-mono break-words truncate max-w-[100px] border border-blue-300">{w.accountNumber}</td>
                      <td className="px-2 py-2 break-words truncate max-w-[120px] border border-blue-300">{w.accountName}</td>
                      <td className="px-2 py-2 border border-blue-300">
                        {w.status === "pending" ? (
                          <button
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-800"
                            onClick={async () => {
                              // Approve withdrawal: set requestedWithdrawals to 0 for this user
                              try {
                                await updateDoc(doc(db, "users", w.id), {
                                  requestedWithdrawals: 0,
                                  // Optionally, set a withdrawal history or status field here
                                })
                                // Optionally, update UI immediately
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
                      <td className="px-2 py-2 border border-blue-300">
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
          )}
        </div>

        {/* Users Table */}
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
            <table className="min-w-full border-2 border-blue-400 rounded text-sm">
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
          )}
        </div>
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