import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc, serverTimestamp, Timestamp, query, where } from "firebase/firestore"

export default function UsersTable({ stockistUserId }: { stockistUserId?: string }) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchUsers() {
      const snap = await getDocs(collection(db, "users"))
      setUsers(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    }
    fetchUsers()
  }, [])

  // Handler for product delivered checkbox
  async function handleDeliveryStatusCheck(user: any) {
    if (!user.id || !stockistUserId) return
    setUpdatingUserId(user.id)
    try {
      await updateDoc(doc(db, "users", user.id), {
        deliveryStatus: {
          isProductDelivered: true,
          time: serverTimestamp(),
          checkedBy: stockistUserId,
        },
      })
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id
            ? {
                ...u,
                deliveryStatus: {
                  isProductDelivered: true,
                  time: new Date(),
                  checkedBy: stockistUserId,
                },
              }
            : u
        )
      )

      // --- Add commission to stockist and uplines ---
      // 1. Fetch stockist doc
      const stockistSnap = await getDocs(query(collection(db, "users"), where("userId", "==", stockistUserId)))
      if (!stockistSnap.empty) {
        const stockistDoc = stockistSnap.docs[0]
        const stockistData = stockistDoc.data()
        // Prepare commission object
        const commissionObj = {
          userId: stockistUserId,
          amount: 600,
          type: "stockist_delivery",
          description: `Delivery commission for user ${user.userId || user.id}`,
          status: "pending",
          createdAt: Timestamp.now(),
          deliveredUserId: user.userId || user.id,
        }
        // Add to stockCommission array in stockist object
        const stockistObj = stockistData.stockist || {}
        const stockCommissionArr = Array.isArray(stockistObj.stockCommission) ? stockistObj.stockCommission : []
        // Prevent duplicate for same user delivery
        if (!stockCommissionArr.some(c => c.deliveredUserId === (user.userId || user.id))) {
          stockCommissionArr.push(commissionObj)
          // --- Decrement products count ---
          let products = typeof stockistObj.products === "number" ? stockistObj.products : 0
          products = Math.max(0, products - 1)
          await updateDoc(doc(db, "users", stockistDoc.id), {
            stockist: {
              ...stockistObj,
              stockCommission: stockCommissionArr,
              products,
            }
          })
        }
        // --- Upline commissions ---
        let uplineId = stockistObj.uplineId || stockistData.sponsorId
        let levels = [200, 100, 100]
        for (let i = 0; i < levels.length && uplineId; i++) {
          // Find upline doc
          const uplineSnap = await getDocs(query(collection(db, "users"), where("userId", "==", uplineId)))
          if (uplineSnap.empty) break
          const uplineDoc = uplineSnap.docs[0]
          const uplineData = uplineDoc.data()
          const arr = Array.isArray(uplineData.stockistCommissions) ? uplineData.stockistCommissions : []
          // Prevent duplicate for same user delivery
          if (!arr.some(c => c.deliveredUserId === (user.userId || user.id))) {
            arr.push({
              userId: uplineId,
              amount: levels[i],
              type: "stockist_upline",
              description: `Upline commission for delivery of user ${user.userId || user.id}`,
              status: "pending",
              createdAt: Timestamp.now(),
              deliveredUserId: user.userId || user.id,
              fromStockist: stockistUserId,
              level: i + 1,
            })
            await updateDoc(doc(db, "users", uplineDoc.id), {
              stockistCommissions: arr
            })
          }
          // Next upline
          uplineId = uplineData.sponsorId
        }
      }
    } catch {}
    setUpdatingUserId(null)
  }

  // Only show table if logged in as stockist (stockistUserId is present)
  if (!stockistUserId) {
    return <div className="p-8 text-center text-red-600 font-bold">You must be logged in as a stockist to view this table.</div>
  }

  if (loading) return <div>Loading users...</div>
  if (users.length === 0) return <div>No users found.</div>

  // Filter users by search (only Collection ID)
  const filteredUsers = users.filter(u => {
    const q = search.trim().toLowerCase()
    if (!q) return true
    return (u.collectionId || "").toLowerCase().includes(q)
  })

  return (
    <div className="overflow-x-auto">
      {/* Search input above the table */}
      <div className="mb-4 flex items-center">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by Collection ID"
          className="w-full max-w-md px-3 py-2 border border-blue-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
      <table className="min-w-[900px] w-full border text-sm">
        <thead>
          <tr className="bg-blue-50">
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">User ID</th>
            <th className="border px-2 py-1">Collection ID</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Stockist</th>
            <th className="border px-2 py-1">Select</th>
            <th className="border px-2 py-1">Product Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((u, idx) => (
            <tr key={u.userId || idx} className="even:bg-blue-50/40">
              <td className="border px-2 py-1">{u.name || u.fullName || "-"}</td>
              <td className="border px-2 py-1 font-mono">{u.userId || "-"}</td>
              <td className="border px-2 py-1 font-mono">{u.collectionId || "-"}</td>
              <td className="border px-2 py-1">{u.email || "-"}</td>
              <td className="border px-2 py-1">{u.phone || "-"}</td>
              <td className="border px-2 py-1">
                {u.stockist ? (
                  <span className="text-green-700 font-bold">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </td>
              <td className="border px-2 py-1 text-center">
                <input
                  type="checkbox"
                  checked={!!u.deliveryStatus?.isProductDelivered}
                  disabled={!!u.deliveryStatus?.isProductDelivered || updatingUserId === u.id}
                  onChange={() => handleDeliveryStatusCheck(u)}
                />
              </td>
              <td className="border px-2 py-1 text-center">
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
  )
}