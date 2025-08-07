"use client"
import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Trophy, UserCircle } from "lucide-react"

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true)
      setError(null)
      try {
        const snap = await getDocs(collection(db, "users"))
        const usersArr = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        setUsers(usersArr)
      } catch {
        setError("Failed to fetch leaderboard")
      }
      setLoading(false)
    }
    fetchUsers()
  }, [])

  function getNetEarning(user: any) {
    let approved = 0
    let pending = 0
    if (Array.isArray(user.commissions)) {
      user.commissions.forEach((c: any) => {
        if (c.status === "approved") approved += c.amount || 0
        if (c.status === "pending") pending += c.amount || 0
      })
    }
    return Math.floor((approved + pending) * 0.9)
  }

  // Sort users by net earning
  const sorted = [...users].sort((a, b) => getNetEarning(b) - getNetEarning(a))

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-xl p-4 sm:p-8 max-w-3xl mx-auto my-8">
      <div className="flex items-center justify-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-yellow-500 drop-shadow" />
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0066E0] tracking-tight drop-shadow">
          Leaderboard
        </h2>
      </div>
      {loading ? (
        <div className="text-blue-700 text-center py-12 font-semibold animate-pulse">
          Loading leaderboard...
        </div>
      ) : error ? (
        <div className="text-red-600 text-center py-12">{error}</div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Always show all users, even those with zero earnings */}
          {users.length === 0 && (
            <div className="text-gray-500 text-center py-8">No users found.</div>
          )}
          {users
            .sort((a, b) => getNetEarning(b) - getNetEarning(a))
            .map((d, idx) => {
              const net = getNetEarning(d)
              const trophyColor =
                idx === 0
                  ? "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
                  : idx === 1
                  ? "bg-gradient-to-r from-gray-300 to-gray-500 text-white"
                  : idx === 2
                  ? "bg-gradient-to-r from-orange-400 to-orange-600 text-white"
                  : "bg-blue-100 text-blue-700"
              return (
                <div
                  key={d.userId || idx}
                  className={`flex items-center gap-4 rounded-xl shadow-md px-4 py-3 bg-white/90 hover:bg-blue-50 transition-all duration-200 border border-blue-100`}
                >
                  <div className="flex flex-col items-center min-w-[40px]">
                    <div
                      className={`rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shadow ${trophyColor}`}
                    >
                      {idx < 3 ? <Trophy className="h-6 w-6" /> : idx + 1}
                    </div>
                    {idx < 3 && (
                      <span className="text-xs font-semibold text-yellow-600 mt-1">
                        {idx === 0 ? "1st" : idx === 1 ? "2nd" : "3rd"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-200 to-blue-400 flex items-center justify-center shadow">
                        <UserCircle className="h-7 w-7 text-blue-700" />
                      </div>
                      <div>
                        <div className="font-bold text-blue-900 text-base sm:text-lg">
                          {d.name || d.fullName || "-"}
                        </div>
                        <div className="text-xs text-gray-500 font-mono">{d.userId || "-"}</div>
                      </div>
                    </div>
                    <div className="ml-auto flex flex-col items-end">
                      <span className="text-lg sm:text-xl font-extrabold text-green-700 drop-shadow">
                        ₦{net.toLocaleString()}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">Total Earning</span>
                    </div>
                  </div>
                </div>
              )
            })}
        </div>
      )}
      <style jsx>{`
        @media (max-width: 640px) {
          .flex-col.sm\\:flex-row {
            flex-direction: column !important;
          }
          .ml-auto {
            margin-left: 0 !important;
          }
          .items-end {
            align-items: flex-start !important;
          }
        }
      `}</style>
    </div>
  )
}
