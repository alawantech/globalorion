"use client"

// This React component fetches and displays the total number of users, total earnings, and pending commissions for the admin dashboard.

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

// Simple copy icon SVG component
function CopyIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="16" height="16" fill="none" viewBox="0 0 20 20">
      <rect x="6" y="6" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="3" y="3" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5"/>
    </svg>
  )
}

export default function AdminDashboard() {
  // State for admin stats
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
      // If using Firebase Auth:
      try {
        const { signOut } = await import("firebase/auth")
        const { auth } = await import("@/lib/firebase")
        await signOut(auth)
      } catch {}
      router.replace("/login")
    }
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
      <main className="max-w-5xl mx-auto px-4 py-8">
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