import { useEffect, useState } from "react"
import { db } from "@/lib/firebase"
import { collection, getDocs } from "firebase/firestore"

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUsers() {
      const snap = await getDocs(collection(db, "users"))
      setUsers(snap.docs.map(doc => doc.data()))
      setLoading(false)
    }
    fetchUsers()
  }, [])

  if (loading) return <div>Loading users...</div>
  if (users.length === 0) return <div>No users found.</div>

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[900px] w-full border text-sm">
        <thead>
          <tr className="bg-blue-50">
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">User ID</th>
            <th className="border px-2 py-1">Email</th>
            <th className="border px-2 py-1">Phone</th>
            <th className="border px-2 py-1">Role</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Stockist</th>
            <th className="border px-2 py-1">Created At</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={u.userId || idx} className="even:bg-blue-50/40">
              <td className="border px-2 py-1">{u.name || u.fullName || "-"}</td>
              <td className="border px-2 py-1 font-mono">{u.userId || "-"}</td>
              <td className="border px-2 py-1">{u.email || "-"}</td>
              <td className="border px-2 py-1">{u.phone || "-"}</td>
              <td className="border px-2 py-1">{u.role || "-"}</td>
              <td className="border px-2 py-1">{u.status || "-"}</td>
              <td className="border px-2 py-1">
                {u.stockist ? (
                  <span className="text-green-700 font-bold">Yes</span>
                ) : (
                  <span className="text-gray-500">No</span>
                )}
              </td>
              <td className="border px-2 py-1">
                {u.createdAt && typeof u.createdAt.toDate === "function"
                  ? u.createdAt.toDate().toLocaleString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
