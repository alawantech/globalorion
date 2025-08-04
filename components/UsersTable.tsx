import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore"

export default function UsersTable({ stockistUserId }: { stockistUserId?: string }) {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)

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
          checkedBy: stockistUserId, // Always set to stockist's userId, never null
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
    } catch {}
    setUpdatingUserId(null)
  }

  // Only show table if logged in as stockist (stockistUserId is present)
  if (!stockistUserId) {
    return <div className="p-8 text-center text-red-600 font-bold">You must be logged in as a stockist to view this table.</div>
  }

  if (loading) return <div>Loading users...</div>
  if (users.length === 0) return <div>No users found.</div>

  return (
    <div className="overflow-x-auto">
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
          {users.map((u, idx) => (
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
                {/* Remove checkedBy display from table */}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}