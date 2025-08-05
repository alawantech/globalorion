"use client"

import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { doc, updateDoc, getDocs, query, collection, where, Timestamp } from "firebase/firestore"

export default function StockistsSection() {
  const [stockists, setStockists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [requestedWithdrawals, setRequestedWithdrawals] = useState<
    { userId: string, name: string, email: string, bankName: string, accountNumber: string, accountName: string, amount: number }[]
  >([])
  const [changingAccountTypeId, setChangingAccountTypeId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStockists() {
      const snap = await getDocs(collection(db, "users"))
      const arr = snap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(u => !!u.stockist)
      setStockists(arr)
      setLoading(false)

      // Collect requested withdrawals for stockists by summing stockCommission with status "requested"
      const withdrawals = arr.map(u => {
        const s = u.stockist || {}
        const comms = Array.isArray(s.stockCommission) ? s.stockCommission : []
        const requestedTotal = comms
          .filter(c => c.status === "requested")
          .reduce((sum, c) => sum + (c.amount || 0), 0)
        if (requestedTotal > 0) {
          return {
            userId: u.userId || u.id,
            name: s.fullName || u.name || "",
            email: s.email || u.email || "",
            bankName: u.bankName || "",
            accountNumber: u.accountNumber || "",
            accountName: u.accountName || "",
            amount: requestedTotal,
          }
        }
        return null
      }).filter(Boolean)
      setRequestedWithdrawals(withdrawals)
    }
    fetchStockists()
  }, [])

  // Filter by search (full name, phone, userId, address, zone, lga, package name/type)
  const filtered = stockists.filter(u => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    const s = u.stockist || {}
    return (
      (s.fullName || u.name || "").toLowerCase().includes(q) ||
      (u.email || s.email || "").toLowerCase().includes(q) ||
      (u.phone || s.phone || "").toLowerCase().includes(q) ||
      (u.userId || u.id || "").toLowerCase().includes(q) ||
      (s.storeAddress || "").toLowerCase().includes(q) ||
      (s.zone || "").toLowerCase().includes(q) ||
      (s.state || "").toLowerCase().includes(q) ||
      (s.lga || "").toLowerCase().includes(q)
    )
  })

  function getCommissionTotals(stockistObj: any) {
    let pending = 0, approved = 0
    const arr = Array.isArray(stockistObj?.stockCommission) ? stockistObj.stockCommission : []
    arr.forEach((c: any) => {
      if (c.status === "pending") pending += c.amount || 0
      if (c.status === "approved") approved += c.amount || 0
    })
    return { pending, approved }
  }

  // Approve requested withdrawal for a stockist
  async function handleApproveWithdrawal(userId: string) {
    try {
      // Find user doc by userId
      const snap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
      if (snap.empty) return
      const userDoc = snap.docs[0]
      const userData = userDoc.data()
      const stockistObj = userData.stockist || {}
      const comms = Array.isArray(stockistObj.stockCommission) ? stockistObj.stockCommission : []
      // Update all requested commissions to approved
      const updatedComms = comms.map(c =>
        c.status === "requested"
          ? { ...c, status: "approved", approvedAt: Timestamp.now() }
          : c
      )
      await updateDoc(doc(db, "users", userDoc.id), {
        stockist: {
          ...stockistObj,
          stockCommission: updatedComms,
        }
      })
      // Optionally, update UI immediately
      setRequestedWithdrawals(prev =>
        prev.filter(w => w.userId !== userId)
      )
    } catch {}
  }

  // Change account type to temporary and remove all stockist commissions for this stockist and uplines
  async function handleChangeAccountTypeToTemporary(userId: string) {
    setChangingAccountTypeId(userId)
    try {
      // Find user doc by userId
      const snap = await getDocs(query(collection(db, "users"), where("userId", "==", userId)))
      if (snap.empty) return
      const userDoc = snap.docs[0]
      const userData = userDoc.data()
      const stockistObj = userData.stockist || {}
      // Remove all stockist commissions for this stockist
      await updateDoc(doc(db, "users", userDoc.id), {
        stockist: {
          ...stockistObj,
          accountType: "temporary",
          stockCommission: [],
        }
      })
      // Remove all uplines' stockist commissions for deliveries made by this stockist
      // Find uplines by sponsorId chain (up to 3 levels)
      let uplineId = stockistObj.uplineId || userData.sponsorId
      for (let i = 0; i < 3 && uplineId; i++) {
        const uplineSnap = await getDocs(query(collection(db, "users"), where("userId", "==", uplineId)))
        if (uplineSnap.empty) break
        const uplineDoc = uplineSnap.docs[0]
        const uplineData = uplineDoc.data()
        const arr = Array.isArray(uplineData.stockistCommissions) ? uplineData.stockistCommissions : []
        // Remove all commissions for deliveries made by this stockist
        const filteredArr = arr.filter(c => c.fromStockist !== userId)
        await updateDoc(doc(db, "users", uplineDoc.id), {
          stockistCommissions: filteredArr
        })
        uplineId = uplineData.sponsorId
      }
      // Optionally, update UI immediately
      setStockists(prev =>
        prev.map(u =>
          (u.userId || u.id) === userId
            ? {
                ...u,
                stockist: {
                  ...u.stockist,
                  accountType: "temporary",
                  stockCommission: [],
                }
              }
            : u
        )
      )
    } catch {}
    setChangingAccountTypeId(null)
  }

  // Total requested withdrawals sum
  const totalRequested = requestedWithdrawals.reduce((sum, w) => sum + (w.amount || 0), 0)

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold mb-6">All Stockists</h2>
      {/* Requested Withdrawals Section */}
      <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">Requested Withdrawals (Stockists)</h3>
        {requestedWithdrawals.length === 0 ? (
          <div className="text-gray-500">No requested withdrawals from stockists.</div>
        ) : (
          <>
            <div className="mb-2 font-bold text-yellow-700 text-xl">
              Total Requested: ₦{totalRequested.toLocaleString()}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border text-xs">
                <thead>
                  <tr className="bg-yellow-100">
                    <th className="border px-2 py-1">User ID</th>
                    <th className="border px-2 py-1">Name</th>
                    <th className="border px-2 py-1">Email</th>
                    <th className="border px-2 py-1">Bank Name</th>
                    <th className="border px-2 py-1">Account Number</th>
                    <th className="border px-2 py-1">Account Name</th>
                    <th className="border px-2 py-1">Requested Amount</th>
                    <th className="border px-2 py-1">Requested At</th>
                    <th className="border px-2 py-1">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requestedWithdrawals.map((w, idx) => (
                    <tr key={w.userId || idx}>
                      <td className="border px-2 py-1 font-mono">{w.userId}</td>
                      <td className="border px-2 py-1">{w.name}</td>
                      <td className="border px-2 py-1">{w.email}</td>
                      <td className="border px-2 py-1">{w.bankName}</td>
                      <td className="border px-2 py-1 font-mono">{w.accountNumber}</td>
                      <td className="border px-2 py-1">{w.accountName}</td>
                      <td className="border px-2 py-1 font-bold text-yellow-700">₦{w.amount.toLocaleString()}</td>
                      <td className="border px-2 py-1">
                        {/* Find requestedAt from the first requested commission */}
                        {(() => {
                          const stockist = stockists.find(u => (u.userId || u.id) === w.userId)
                          const comms = Array.isArray(stockist?.stockist?.stockCommission) ? stockist.stockist.stockCommission : []
                          const reqComm = comms.find((c: any) => c.status === "requested")
                          if (reqComm?.requestedAt) {
                            if (typeof reqComm.requestedAt?.toDate === "function") {
                              return reqComm.requestedAt.toDate().toLocaleString()
                            }
                            if (typeof reqComm.requestedAt === "number") {
                              return new Date(reqComm.requestedAt).toLocaleString()
                            }
                            return String(reqComm.requestedAt)
                          }
                          return "-"
                        })()}
                      </td>
                      <td className="border px-2 py-1">
                        <button
                          className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-800"
                          onClick={() => handleApproveWithdrawal(w.userId)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      {/* Search bar */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, user ID, address, zone, LGA, package"
          className="w-full max-w-md px-3 py-2 border border-blue-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      {loading ? (
        <div className="p-8 text-center">Loading stockists...</div>
      ) : (
        <div className="w-full overflow-x-auto">
          <table className="w-full border text-xs">
            <thead>
              <tr className="bg-blue-50">
                <th className="border px-2 py-1">Full Name</th>
                <th className="border px-2 py-1">Phone</th>
                <th className="border px-2 py-1">User ID</th>
                <th className="border px-2 py-1">Address</th>
                <th className="border px-2 py-1">Zone</th>
                <th className="border px-2 py-1">LGA</th>
                <th className="border px-2 py-1">Account Type</th>
                <th className="border px-2 py-1">Pending Commissions</th>
                <th className="border px-2 py-1">Approved Commissions</th>
                <th className="border px-2 py-1">Package Name</th>
                <th className="border px-2 py-1">Package Type</th>
                <th className="border px-2 py-1">Products</th>
                <th className="border px-2 py-1">Status</th>
                <th className="border px-2 py-1">Change to Temporary</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => {
                const s = u.stockist || {}
                const { pending, approved } = getCommissionTotals(s)
                return (
                  <tr key={u.id}>
                    <td className="border px-2 py-1">{s.fullName || u.name || "-"}</td>
                    <td className="border px-2 py-1">{u.phone || "-"}</td>
                    <td className="border px-2 py-1 font-mono">{u.userId || "-"}</td>
                    <td className="border px-2 py-1">{s.storeAddress || "-"}</td>
                    <td className="border px-2 py-1">{s.zone || "-"}</td>
                    <td className="border px-2 py-1">{s.lga || "-"}</td>
                    <td className="border px-2 py-1">{s.accountType || "-"}</td>
                    <td className="border px-2 py-1 font-bold text-yellow-700">₦{pending.toLocaleString()}</td>
                    <td className="border px-2 py-1 font-bold text-green-700">₦{approved.toLocaleString()}</td>
                    <td className="border px-2 py-1">{s.packageName || "-"}</td>
                    <td className="border px-2 py-1">{s.packageType || "-"}</td>
                    <td className="border px-2 py-1">{s.products || "-"}</td>
                    <td className="border px-2 py-1">{s.status || "-"}</td>
                    <td className="border px-2 py-1 text-center">
                      <input
                        type="checkbox"
                        checked={s.accountType === "temporary"}
                        disabled={changingAccountTypeId === (u.userId || u.id)}
                        onChange={() => handleChangeAccountTypeToTemporary(u.userId || u.id)}
                        title="Change account type to temporary and remove all stockist commissions"
                      />
                      {changingAccountTypeId === (u.userId || u.id) && (
                        <span className="ml-2 text-xs text-yellow-700">Updating...</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
