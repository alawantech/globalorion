"use client"

import { useEffect, useState } from "react"

export default function RequestedWithdrawalsSection({ userId }: { userId: string }) {
  const [requestedWithdrawals, setRequestedWithdrawals] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/user/stats?userId=${userId}`)
        const data = await res.json()
        if (res.ok && typeof data.requestedWithdrawals === "number") {
          setRequestedWithdrawals(data.requestedWithdrawals)
        } else {
          setError(data?.error || "Failed to fetch requested withdrawals")
        }
      } catch {
        setError("Failed to fetch requested withdrawals")
      }
      setLoading(false)
    }
    if (userId) fetchStats()
  }, [userId])

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-blue-900 mb-2">Requested Withdrawals</h3>
      {loading ? (
        <span className="text-blue-700">Loading...</span>
      ) : error ? (
        <span className="text-red-600">{error}</span>
      ) : (
        <div className="text-2xl font-bold text-blue-900">
          ₦{requestedWithdrawals.toLocaleString()}
          <span className="ml-2 text-sm text-gray-500">Awaiting admin approval</span>
        </div>
      )}
    </div>
  )
}
