// This React component fetches and displays the total number of users, total earnings, and pending commissions for the admin dashboard.

import { useEffect, useState } from "react"

export default function AdminDashboard() {
  // State for admin stats
  const [totalUsers, setTotalUsers] = useState<number | null>(null)
  const [totalEarnings, setTotalEarnings] = useState<number | null>(null)
  const [pendingCommissions, setPendingCommissions] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Add a mount check to verify if the component is rendering
  useEffect(() => {
    console.log("AdminDashboard component mounted!")
  }, [])

  // Fetch admin stats from the API on mount
  useEffect(() => {
    async function fetchAdminStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch("/api/admin/stats", { cache: "no-store" })
        // Check if the response is actually received
        if (!res) {
          setError("No response from API")
          setLoading(false)
          return
        }
        // Check status code
        if (!res.ok) {
          setError("API error: " + res.status)
          setLoading(false)
          return
        }
        const text = await res.text()
        let data: any = {}
        try {
          data = JSON.parse(text)
        } catch {
          setError("Failed to parse API response")
          setLoading(false)
          return
        }
        // Log to console as well
        console.log("Admin stats API response:", data)
        if (data && typeof data === "object") {
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
        } else {
          setError("API returned invalid data")
        }
      } catch (e: any) {
        setError("Failed to fetch stats")
      }
      setLoading(false)
    }
    fetchAdminStats()
  }, [])

  // Remove all alerts and banners, and add a visible test element in the main render
  // Also, add a test button to manually trigger the fetch and log the result

  const [testResult, setTestResult] = useState<string>("")

  async function manualFetch() {
    setTestResult("Fetching...")
    try {
      const res = await fetch("/api/admin/stats", { cache: "no-store" })
      const text = await res.text()
      setTestResult("Raw API response: " + text)
      let data: any = {}
      try {
        data = JSON.parse(text)
      } catch {
        setTestResult("Failed to parse JSON: " + text)
        return
      }
      setTestResult("Parsed API response: " + JSON.stringify(data))
    } catch (e: any) {
      setTestResult("Manual fetch failed: " + (e?.message || e))
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

  // Add a visible test element outside of all logic to confirm rendering
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100">
      <div className="fixed top-0 left-0 w-full bg-red-700 text-white text-center py-2 z-50 font-bold">
        If you see this banner, <b>e:\Globalorion\app\admin\dashboard.tsx</b> is being rendered by Next.js!
      </div>
      {/* Manual test UI */}
      <div className="fixed top-0 left-0 w-full bg-blue-900 text-white text-center py-2 z-50">
        <span>AdminDashboard component is rendering.</span>
        <button
          style={{ marginLeft: 16, padding: "4px 12px", background: "#fff", color: "#222", borderRadius: 4 }}
          onClick={manualFetch}
        >
          Test API Fetch
        </button>
        <span style={{ marginLeft: 16 }}>{testResult}</span>
      </div>
      <main className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-blue-900 mb-8">Admin Dashboard</h1>
        {showWarning && (
          <div className="mb-4 p-3 bg-yellow-100 text-yellow-800 rounded">
            Warning: Some stats could not be loaded. Please check your API and data.
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
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

